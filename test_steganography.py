#!/usr/bin/env python3
"""
Simple test script for Ghost Protocol steganography functionality
"""
import sys
import os
from PIL import Image
import numpy as np

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from app.services.steganography import DCTSteganography
    print("✅ Successfully imported steganography module")
except ImportError as e:
    print(f"❌ Failed to import steganography module: {e}")
    sys.exit(1)

def create_test_image(width=512, height=512):
    """Create a simple test image"""
    # Create a gradient image
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    for y in range(height):
        for x in range(width):
            image[y, x] = [
                int(255 * x / width),      # Red gradient
                int(255 * y / height),     # Green gradient
                128                        # Constant blue
            ]
    
    return Image.fromarray(image, 'RGB')

def test_steganography():
    """Test the steganography encode/decode functionality"""
    print("\n🧪 Testing Ghost Protocol Steganography Engine")
    print("=" * 50)
    
    # Create steganography service
    stego = DCTSteganography()
    
    # Create test image
    print("📸 Creating test image...")
    test_image = create_test_image()
    
    # Convert to bytes
    import io
    img_buffer = io.BytesIO()
    test_image.save(img_buffer, format='JPEG', quality=85)
    image_bytes = img_buffer.getvalue()
    
    # Test message
    test_message = "Hello from Ghost Protocol! This is a secret message hidden using DCT-based steganography. 🔐👻"
    print(f"🔤 Test message: {test_message}")
    print(f"📏 Message length: {len(test_message)} characters")
    
    try:
        # Encode message
        print("\n🔒 Encoding message...")
        encoded_image_bytes = stego.encode_message(image_bytes, test_message)
        print(f"✅ Message encoded successfully! Encoded image size: {len(encoded_image_bytes)} bytes")
        
        # Decode message
        print("\n🔓 Decoding message...")
        decoded_message = stego.decode_message(encoded_image_bytes)
        print(f"✅ Message decoded successfully!")
        print(f"📤 Decoded message: {decoded_message}")
        
        # Verify message integrity
        if decoded_message == test_message:
            print("\n🎉 SUCCESS: Message integrity verified!")
            print("✅ Encode/decode cycle completed successfully")
            return True
        else:
            print("\n❌ FAILURE: Message integrity check failed")
            print(f"Expected: {test_message}")
            print(f"Got: {decoded_message}")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False

def test_capacity():
    """Test steganography capacity limits"""
    print("\n📊 Testing Steganography Capacity")
    print("=" * 40)
    
    stego = DCTSteganography()
    
    # Create larger test image
    test_image = create_test_image(800, 600)
    
    import io
    img_buffer = io.BytesIO()
    test_image.save(img_buffer, format='JPEG', quality=85)
    image_bytes = img_buffer.getvalue()
    
    # Test different message lengths
    base_message = "This is a capacity test message. "
    
    for multiplier in [1, 5, 10, 20, 50]:
        test_message = base_message * multiplier
        message_length = len(test_message)
        
        try:
            print(f"🧪 Testing {message_length} character message...")
            encoded_image_bytes = stego.encode_message(image_bytes, test_message)
            decoded_message = stego.decode_message(encoded_image_bytes)
            
            if decoded_message == test_message:
                print(f"✅ Success: {message_length} characters")
            else:
                print(f"❌ Failed: {message_length} characters")
                
        except Exception as e:
            print(f"❌ Error at {message_length} characters: {str(e)}")
            break

def main():
    """Main test function"""
    print("🚀 Ghost Protocol Steganography Test Suite")
    print("=" * 60)
    
    # Test basic functionality
    success = test_steganography()
    
    if success:
        # Test capacity if basic test passes
        test_capacity()
        
        print("\n" + "=" * 60)
        print("🎊 All tests completed! Ghost Protocol steganography is working.")
        print("🔐 Ready for secure, hidden messaging!")
    else:
        print("\n" + "=" * 60)
        print("❌ Tests failed. Please check the implementation.")
        sys.exit(1)

if __name__ == "__main__":
    main()