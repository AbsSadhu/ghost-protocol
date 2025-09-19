import numpy as np
from PIL import Image
import io
import base64
from scipy.fftpack import dct, idct
import struct

class SteganographyService:
    def __init__(self):
        self.block_size = 8  # DCT block size
        self.quality_factor = 50  # JPEG quality factor
        
    def _dct2(self, block):
        """2D DCT transform"""
        return dct(dct(block.T, norm='ortho').T, norm='ortho')
    
    def _idct2(self, block):
        """2D inverse DCT transform"""
        return idct(idct(block.T, norm='ortho').T, norm='ortho')
    
    def _get_quantization_matrix(self):
        """Standard JPEG quantization matrix"""
        return np.array([
            [16, 11, 10, 16, 24, 40, 51, 61],
            [12, 12, 14, 19, 26, 58, 60, 55],
            [14, 13, 16, 24, 40, 57, 69, 56],
            [14, 17, 22, 29, 51, 87, 80, 62],
            [18, 22, 37, 56, 68, 109, 103, 77],
            [24, 35, 55, 64, 81, 104, 113, 92],
            [49, 64, 78, 87, 103, 121, 120, 101],
            [72, 92, 95, 98, 112, 100, 103, 99]
        ])
    
    def _string_to_bits(self, message):
        """Convert string message to bit array"""
        # Add length header and terminator
        full_message = f"{len(message):08b}" + message + "\x00"
        bits = []
        for char in full_message:
            bits.extend([int(b) for b in format(ord(char), '08b')])
        return bits
    
    def _bits_to_string(self, bits):
        """Convert bit array to string message"""
        if len(bits) < 8:
            return ""
        
        # Extract length from first 8 bits
        length_bits = bits[:8]
        length = int(''.join(map(str, length_bits)), 2)
        
        if length <= 0 or len(bits) < 8 + length * 8:
            return ""
        
        # Extract message bits
        message_bits = bits[8:8 + length * 8]
        message = ""
        
        for i in range(0, len(message_bits), 8):
            byte_bits = message_bits[i:i+8]
            if len(byte_bits) == 8:
                char_code = int(''.join(map(str, byte_bits)), 2)
                if char_code == 0:  # Terminator
                    break
                message += chr(char_code)
        
        return message
    
    def _embed_bit_in_dct_coefficient(self, coefficient, bit):
        """Embed a bit in DCT coefficient using LSB"""
        coeff_int = int(coefficient)
        if coeff_int == 0:
            return 1 if bit else -1
        
        # Embed bit in LSB
        if coeff_int > 0:
            coeff_int = (coeff_int & ~1) | bit
        else:
            coeff_int = (coeff_int | 1) if bit else (coeff_int & ~1)
        
        return float(coeff_int)
    
    def _extract_bit_from_dct_coefficient(self, coefficient):
        """Extract bit from DCT coefficient LSB"""
        coeff_int = int(coefficient)
        if coeff_int == 0:
            return 0
        return abs(coeff_int) & 1
    
    def hide_message(self, image_data, message):
        """Hide message in image using DCT steganography"""
        try:
            # Load image
            if isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data))
            else:
                image = image_data
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image, dtype=np.float32)
            height, width = img_array.shape[:2]
            
            # Convert message to bits
            message_bits = self._string_to_bits(message)
            
            if len(message_bits) > (height // 8) * (width // 8) * 3:
                raise ValueError("Message too long for image capacity")
            
            # Process each color channel
            result_channels = []
            bit_index = 0
            
            for channel in range(3):  # RGB channels
                channel_data = img_array[:, :, channel]
                
                # Pad image dimensions to be divisible by block_size
                pad_height = (8 - height % 8) % 8
                pad_width = (8 - width % 8) % 8
                padded_channel = np.pad(channel_data, 
                                      ((0, pad_height), (0, pad_width)), 
                                      mode='edge')
                
                # Process 8x8 blocks
                for i in range(0, padded_channel.shape[0], 8):
                    for j in range(0, padded_channel.shape[1], 8):
                        if bit_index >= len(message_bits):
                            break
                        
                        block = padded_channel[i:i+8, j:j+8]
                        
                        # Apply DCT
                        dct_block = self._dct2(block)
                        
                        # Embed bit in middle-frequency coefficient (3,3)
                        # This position is less likely to be heavily compressed
                        if bit_index < len(message_bits):
                            dct_block[3, 3] = self._embed_bit_in_dct_coefficient(
                                dct_block[3, 3], message_bits[bit_index]
                            )
                            bit_index += 1
                        
                        # Apply inverse DCT
                        reconstructed_block = self._idct2(dct_block)
                        padded_channel[i:i+8, j:j+8] = reconstructed_block
                    
                    if bit_index >= len(message_bits):
                        break
                
                # Remove padding
                result_channels.append(padded_channel[:height, :width])
            
            # Combine channels
            result_array = np.stack(result_channels, axis=2)
            result_array = np.clip(result_array, 0, 255).astype(np.uint8)
            
            # Convert back to image
            result_image = Image.fromarray(result_array)
            
            # Convert to base64 for JSON response
            buffer = io.BytesIO()
            result_image.save(buffer, format='JPEG', quality=85)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return img_str
        
        except Exception as e:
            raise ValueError(f"Failed to hide message: {str(e)}")
    
    def extract_message(self, image_data):
        """Extract hidden message from image using DCT steganography"""
        try:
            # Load image
            if isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data))
            else:
                image = image_data
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image, dtype=np.float32)
            height, width = img_array.shape[:2]
            
            # Extract bits from each channel
            extracted_bits = []
            
            for channel in range(3):  # RGB channels
                channel_data = img_array[:, :, channel]
                
                # Pad image dimensions to be divisible by block_size
                pad_height = (8 - height % 8) % 8
                pad_width = (8 - width % 8) % 8
                padded_channel = np.pad(channel_data, 
                                      ((0, pad_height), (0, pad_width)), 
                                      mode='edge')
                
                # Process 8x8 blocks
                for i in range(0, padded_channel.shape[0], 8):
                    for j in range(0, padded_channel.shape[1], 8):
                        block = padded_channel[i:i+8, j:j+8]
                        
                        # Apply DCT
                        dct_block = self._dct2(block)
                        
                        # Extract bit from coefficient (3,3)
                        bit = self._extract_bit_from_dct_coefficient(dct_block[3, 3])
                        extracted_bits.append(bit)
            
            # Convert bits to message
            message = self._bits_to_string(extracted_bits)
            return message
        
        except Exception as e:
            raise ValueError(f"Failed to extract message: {str(e)}")