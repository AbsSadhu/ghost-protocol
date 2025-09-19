"""
DCT-based JPEG Steganography Engine for Ghost Protocol
Hides messages in JPEG DCT coefficients for ultimate privacy
"""
import io
import numpy as np
from PIL import Image
from scipy.fftpack import dct, idct
from typing import Tuple, Optional
import base64


class DCTSteganography:
    """DCT-based steganography implementation for JPEG images"""
    
    def __init__(self, quality: int = 85):
        self.quality = quality
        self.block_size = 8
        
    def _rgb_to_ycbcr(self, image: np.ndarray) -> np.ndarray:
        """Convert RGB image to YCbCr color space"""
        xform = np.array([[.299, .587, .114], 
                         [-.169, -.331, .5], 
                         [.5, -.419, -.081]])
        ycbcr = image.dot(xform.T)
        ycbcr[:, :, [1, 2]] += 128
        return np.uint8(ycbcr)
    
    def _ycbcr_to_rgb(self, image: np.ndarray) -> np.ndarray:
        """Convert YCbCr image back to RGB color space"""
        xform = np.array([[1, 0, 1.402], 
                         [1, -0.34414, -.71414], 
                         [1, 1.772, 0]])
        rgb = image.astype(np.float32)
        rgb[:, :, [1, 2]] -= 128
        rgb = rgb.dot(xform.T)
        np.putmask(rgb, rgb > 255, 255)
        np.putmask(rgb, rgb < 0, 0)
        return np.uint8(rgb)
    
    def _apply_dct(self, image_block: np.ndarray) -> np.ndarray:
        """Apply 2D DCT to an 8x8 image block"""
        return dct(dct(image_block.T, norm='ortho').T, norm='ortho')
    
    def _apply_idct(self, dct_block: np.ndarray) -> np.ndarray:
        """Apply inverse 2D DCT to get back image block"""
        return idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
    
    def _get_message_bits(self, message: str) -> list:
        """Convert message to binary representation"""
        # Add delimiter to mark end of message
        full_message = message + "###END###"
        bits = []
        for char in full_message:
            char_bits = format(ord(char), '08b')
            bits.extend([int(b) for b in char_bits])
        return bits
    
    def _embed_bit_in_coefficient(self, coefficient: float, bit: int) -> float:
        """Embed a bit in a DCT coefficient using LSB substitution"""
        coeff_int = int(abs(coefficient))
        if coeff_int == 0:
            return 1 if bit == 1 else 0
        
        # Modify the least significant bit
        if coeff_int % 2 != bit:
            if coefficient > 0:
                return coefficient + (1 if coeff_int % 2 == 0 else -1)
            else:
                return coefficient - (1 if coeff_int % 2 == 0 else -1)
        return coefficient
    
    def _extract_bit_from_coefficient(self, coefficient: float) -> int:
        """Extract a bit from a DCT coefficient"""
        return int(abs(coefficient)) % 2
    
    def encode_message(self, image_bytes: bytes, message: str) -> bytes:
        """Encode a message into a JPEG image using DCT steganography"""
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            img_array = np.array(image)
            height, width = img_array.shape[:2]
            
            # Convert to YCbCr (we'll embed in Y channel)
            ycbcr = self._rgb_to_ycbcr(img_array)
            y_channel = ycbcr[:, :, 0].astype(np.float32) - 128  # Center around 0
            
            # Get message bits
            message_bits = self._get_message_bits(message)
            
            # Ensure image is large enough
            max_bits = (height // self.block_size) * (width // self.block_size) * 32  # Use 32 coefficients per block
            if len(message_bits) > max_bits:
                raise ValueError("Message too long for this image")
            
            # Process image in 8x8 blocks
            bit_index = 0
            for i in range(0, height - height % self.block_size, self.block_size):
                for j in range(0, width - width % self.block_size, self.block_size):
                    if bit_index >= len(message_bits):
                        break
                    
                    # Extract 8x8 block
                    block = y_channel[i:i+self.block_size, j:j+self.block_size]
                    
                    # Apply DCT
                    dct_block = self._apply_dct(block)
                    
                    # Embed bits in mid-frequency coefficients (skip DC and high freq)
                    positions = [(1, 0), (0, 1), (1, 1), (2, 0), (0, 2), (2, 1), (1, 2), (3, 0)]
                    for pos in positions:
                        if bit_index < len(message_bits):
                            row, col = pos
                            if row < self.block_size and col < self.block_size:
                                bit = message_bits[bit_index]
                                dct_block[row, col] = self._embed_bit_in_coefficient(
                                    dct_block[row, col], bit
                                )
                                bit_index += 1
                    
                    # Apply inverse DCT
                    modified_block = self._apply_idct(dct_block)
                    y_channel[i:i+self.block_size, j:j+self.block_size] = modified_block
                
                if bit_index >= len(message_bits):
                    break
            
            # Convert back to RGB
            ycbcr[:, :, 0] = np.clip(y_channel + 128, 0, 255).astype(np.uint8)
            rgb_array = self._ycbcr_to_rgb(ycbcr)
            
            # Save as JPEG
            result_image = Image.fromarray(rgb_array)
            output = io.BytesIO()
            result_image.save(output, format='JPEG', quality=self.quality)
            return output.getvalue()
            
        except Exception as e:
            raise Exception(f"Failed to encode message: {str(e)}")
    
    def decode_message(self, image_bytes: bytes) -> str:
        """Decode a message from a JPEG image using DCT steganography"""
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            img_array = np.array(image)
            height, width = img_array.shape[:2]
            
            # Convert to YCbCr
            ycbcr = self._rgb_to_ycbcr(img_array)
            y_channel = ycbcr[:, :, 0].astype(np.float32) - 128
            
            # Extract bits
            extracted_bits = []
            for i in range(0, height - height % self.block_size, self.block_size):
                for j in range(0, width - width % self.block_size, self.block_size):
                    # Extract 8x8 block
                    block = y_channel[i:i+self.block_size, j:j+self.block_size]
                    
                    # Apply DCT
                    dct_block = self._apply_dct(block)
                    
                    # Extract bits from same positions used for embedding
                    positions = [(1, 0), (0, 1), (1, 1), (2, 0), (0, 2), (2, 1), (1, 2), (3, 0)]
                    for pos in positions:
                        row, col = pos
                        if row < self.block_size and col < self.block_size:
                            bit = self._extract_bit_from_coefficient(dct_block[row, col])
                            extracted_bits.append(bit)
            
            # Convert bits back to string
            message = ""
            for i in range(0, len(extracted_bits), 8):
                if i + 7 < len(extracted_bits):
                    byte_bits = extracted_bits[i:i+8]
                    char_code = 0
                    for j, bit in enumerate(byte_bits):
                        char_code += bit * (2 ** (7 - j))
                    
                    if char_code == 0:  # Null character
                        break
                    
                    try:
                        char = chr(char_code)
                        message += char
                        
                        # Check for end delimiter
                        if message.endswith("###END###"):
                            return message[:-9]  # Remove delimiter
                    except ValueError:
                        # Invalid character, might have reached padding
                        break
            
            return message
            
        except Exception as e:
            raise Exception(f"Failed to decode message: {str(e)}")


def create_steganography_service() -> DCTSteganography:
    """Factory function to create steganography service"""
    return DCTSteganography()