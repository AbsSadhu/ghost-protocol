#!/usr/bin/env python3
"""
Simple demonstration of Ghost Protocol DCT-based steganography
This script shows the core steganography functionality without external dependencies
"""

import os
import sys
import math
import base64
from typing import List, Tuple

class SimpleDCTSteganography:
    """
    A simplified DCT-based steganography implementation for demonstration
    This uses basic discrete cosine transform principles without heavy dependencies
    """
    
    def __init__(self):
        self.block_size = 8
    
    def simple_dct_1d(self, x: List[float]) -> List[float]:
        """
        Simple 1D DCT implementation (Type-II DCT)
        """
        N = len(x)
        X = [0.0] * N
        
        for k in range(N):
            sum_val = 0.0
            for n in range(N):
                sum_val += x[n] * math.cos(math.pi * k * (2*n + 1) / (2*N))
            
            if k == 0:
                X[k] = sum_val * math.sqrt(1/N)
            else:
                X[k] = sum_val * math.sqrt(2/N)
        
        return X
    
    def simple_idct_1d(self, X: List[float]) -> List[float]:
        """
        Simple 1D inverse DCT implementation
        """
        N = len(X)
        x = [0.0] * N
        
        for n in range(N):
            sum_val = 0.0
            for k in range(N):
                if k == 0:
                    coeff = X[k] * math.sqrt(1/N)
                else:
                    coeff = X[k] * math.sqrt(2/N)
                sum_val += coeff * math.cos(math.pi * k * (2*n + 1) / (2*N))
            x[n] = sum_val
        
        return x
    
    def simple_dct_2d(self, block: List[List[float]]) -> List[List[float]]:
        """
        Simple 2D DCT using separable transforms
        """
        rows = len(block)
        cols = len(block[0])
        
        # DCT on rows
        temp = []
        for i in range(rows):
            temp.append(self.simple_dct_1d(block[i]))
        
        # DCT on columns
        result = [[0.0 for _ in range(cols)] for _ in range(rows)]
        for j in range(cols):
            col = [temp[i][j] for i in range(rows)]
            dct_col = self.simple_dct_1d(col)
            for i in range(rows):
                result[i][j] = dct_col[i]
        
        return result
    
    def simple_idct_2d(self, block: List[List[float]]) -> List[List[float]]:
        """
        Simple 2D inverse DCT using separable transforms
        """
        rows = len(block)
        cols = len(block[0])
        
        # IDCT on columns
        temp = [[0.0 for _ in range(cols)] for _ in range(rows)]
        for j in range(cols):
            col = [block[i][j] for i in range(rows)]
            idct_col = self.simple_idct_1d(col)
            for i in range(rows):
                temp[i][j] = idct_col[i]
        
        # IDCT on rows
        result = []
        for i in range(rows):
            result.append(self.simple_idct_1d(temp[i]))
        
        return result
    
    def string_to_bits(self, message: str) -> List[int]:
        """Convert string to binary representation"""
        bits = []
        # Add message length as header (16 bits)
        length = len(message)
        for i in range(15, -1, -1):
            bits.append((length >> i) & 1)
        
        # Add message content
        for char in message:
            char_code = ord(char)
            for i in range(7, -1, -1):
                bits.append((char_code >> i) & 1)
        
        return bits
    
    def bits_to_string(self, bits: List[int]) -> str:
        """Convert binary representation back to string"""
        if len(bits) < 16:
            return ""
        
        # Extract length from first 16 bits
        length = 0
        for i in range(16):
            length = (length << 1) | bits[i]
        
        if length <= 0 or len(bits) < 16 + length * 8:
            return ""
        
        # Extract message
        message = ""
        for i in range(length):
            char_code = 0
            start_bit = 16 + i * 8
            for j in range(8):
                if start_bit + j < len(bits):
                    char_code = (char_code << 1) | bits[start_bit + j]
            if char_code > 0:  # Only add non-null characters
                message += chr(char_code)
        
        return message
    
    def embed_bit_in_coefficient(self, coeff: float, bit: int) -> float:
        """Embed a bit in a DCT coefficient using quantization-based approach"""
        # Use a larger step size for more robust embedding
        step_size = 4.0
        
        # Quantize coefficient
        quantized = round(coeff / step_size)
        
        # Embed bit by making quantized value even/odd
        if bit == 0:
            # Make even
            if quantized % 2 != 0:
                quantized += 1 if quantized >= 0 else -1
        else:
            # Make odd
            if quantized % 2 == 0:
                quantized += 1 if quantized >= 0 else -1
        
        return quantized * step_size
    
    def extract_bit_from_coefficient(self, coeff: float) -> int:
        """Extract bit from DCT coefficient using quantization-based approach"""
        step_size = 4.0
        quantized = round(coeff / step_size)
        return abs(quantized) % 2
    
    def hide_message_in_data(self, data: List[List[int]], message: str) -> List[List[int]]:
        """
        Hide message in 2D data (simulating image data)
        In a real implementation, this would work with actual image pixel data
        """
        if not data or not data[0]:
            raise ValueError("Invalid data")
        
        rows, cols = len(data), len(data[0])
        message_bits = self.string_to_bits(message)
        
        if len(message_bits) > (rows // 8) * (cols // 8):
            raise ValueError("Message too long for data capacity")
        
        # Convert to float for DCT processing
        float_data = [[float(data[i][j]) for j in range(cols)] for i in range(rows)]
        result_data = [row[:] for row in float_data]  # Copy
        
        bit_index = 0
        
        # Process 8x8 blocks
        for block_row in range(0, rows - 7, 8):
            for block_col in range(0, cols - 7, 8):
                if bit_index >= len(message_bits):
                    break
                
                # Extract 8x8 block
                block = []
                for i in range(8):
                    row_data = []
                    for j in range(8):
                        row_data.append(float_data[block_row + i][block_col + j])
                    block.append(row_data)
                
                # Apply DCT
                dct_block = self.simple_dct_2d(block)
                
                # Embed bit in middle frequency coefficient (3,3)
                if bit_index < len(message_bits):
                    dct_block[3][3] = self.embed_bit_in_coefficient(
                        dct_block[3][3], message_bits[bit_index]
                    )
                    bit_index += 1
                
                # Apply inverse DCT
                idct_block = self.simple_idct_2d(dct_block)
                
                # Put block back
                for i in range(8):
                    for j in range(8):
                        result_data[block_row + i][block_col + j] = idct_block[i][j]
            
            if bit_index >= len(message_bits):
                break
        
        # Convert back to int
        int_result = [[int(round(result_data[i][j])) for j in range(cols)] for i in range(rows)]
        return int_result
    
    def extract_message_from_data(self, data: List[List[int]]) -> str:
        """Extract hidden message from 2D data"""
        if not data or not data[0]:
            return ""
        
        rows, cols = len(data), len(data[0])
        float_data = [[float(data[i][j]) for j in range(cols)] for i in range(rows)]
        
        extracted_bits = []
        
        # Process 8x8 blocks
        for block_row in range(0, rows - 7, 8):
            for block_col in range(0, cols - 7, 8):
                # Extract 8x8 block
                block = []
                for i in range(8):
                    row_data = []
                    for j in range(8):
                        row_data.append(float_data[block_row + i][block_col + j])
                    block.append(row_data)
                
                # Apply DCT
                dct_block = self.simple_dct_2d(block)
                
                # Extract bit from coefficient (3,3)
                bit = self.extract_bit_from_coefficient(dct_block[3][3])
                extracted_bits.append(bit)
        
        return self.bits_to_string(extracted_bits)

def demonstrate_steganography():
    """Demonstrate the steganography functionality"""
    print("🔬 Ghost Protocol - DCT Steganography Demonstration")
    print("=" * 60)
    
    # Create steganography service
    stego = SimpleDCTSteganography()
    
    # Create sample data (simulating a 128x128 grayscale image)
    print("Creating sample data (simulating 128x128 image)...")
    sample_data = []
    for i in range(128):
        row = []
        for j in range(128):
            # Create a simple pattern
            value = int(128 + 50 * math.sin(i * 0.1) * math.cos(j * 0.1))
            row.append(max(0, min(255, value)))
        sample_data.append(row)
    
    print(f"Original data size: {len(sample_data)}x{len(sample_data[0])}")
    
    # Message to hide
    secret_message = "Ghost Protocol works!"
    print(f"Secret message: '{secret_message}'")
    print(f"Message length: {len(secret_message)} characters")
    
    try:
        # Hide the message
        print("\n🔒 Hiding message using DCT steganography...")
        stego_data = stego.hide_message_in_data(sample_data, secret_message)
        print("✅ Message successfully hidden!")
        
        # Calculate differences
        differences = 0
        max_diff = 0
        for i in range(len(sample_data)):
            for j in range(len(sample_data[0])):
                diff = abs(sample_data[i][j] - stego_data[i][j])
                if diff > 0:
                    differences += 1
                max_diff = max(max_diff, diff)
        
        total_pixels = len(sample_data) * len(sample_data[0])
        print(f"Modified pixels: {differences}/{total_pixels} ({differences/total_pixels*100:.2f}%)")
        print(f"Maximum pixel difference: {max_diff}")
        
        # Extract the message
        print("\n🔓 Extracting hidden message...")
        extracted_message = stego.extract_message_from_data(stego_data)
        print(f"Extracted message: '{extracted_message}'")
        
        # Verify success
        if extracted_message == secret_message:
            print("✅ SUCCESS: Message extracted correctly!")
        else:
            print("❌ ERROR: Message extraction failed!")
            print(f"Expected: '{secret_message}'")
            print(f"Got: '{extracted_message}'")
    
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("\n" + "=" * 60)
    print("Demonstration complete!")

if __name__ == "__main__":
    demonstrate_steganography()