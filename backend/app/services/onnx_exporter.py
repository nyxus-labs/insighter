import torch
import torch.onnx

def export_to_onnx(model, dummy_input, path="model.onnx"):
    torch.onnx.export(model, dummy_input, path, 
                      opset_version=11, 
                      input_names=['input'], 
                      output_names=['output'])
    return path
