# Project Zero-Thermal

## Overview
Zero-Thermal 1.58B (ZT-1) is a custom-built, high-efficiency AI model designed to run on any architecture with minimal energy consumption using 1.58-bit Ternary quantization (BitNet architecture).

## Structure
- `bitnet.py`: PyTorch implementation of the BitNet architecture (BitLinear layers).
- `cpp/`: C++ Inference Engine prototype.
- `requirements.txt`: Python dependencies.

## Usage

### Python Model
To test the PyTorch model definition:
```bash
python3 zero_thermal/test_bitnet.py
```

### C++ Inference Engine
To compile and run the C++ inference engine prototype:
```bash
cd zero_thermal/cpp
make
./inference_engine
```
