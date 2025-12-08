import sys
import os

# Add the parent directory to sys.path to allow importing zero_thermal
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
from zero_thermal.bitnet import BitNetTransformer

def test_bitnet_initialization():
    vocab_size = 1000
    d_model = 128
    n_head = 4
    num_layers = 2
    dim_feedforward = 256

    model = BitNetTransformer(vocab_size, d_model, n_head, num_layers, dim_feedforward)
    print("Model initialized successfully.")

    # Check parameters
    print(f"Total parameters: {sum(p.numel() for p in model.parameters())}")

    # Dummy input
    x = torch.randint(0, vocab_size, (1, 32))

    # Forward pass
    output = model(x)
    print(f"Output shape: {output.shape}")

    assert output.shape == (1, 32, vocab_size)
    print("Forward pass successful.")

if __name__ == "__main__":
    test_bitnet_initialization()
