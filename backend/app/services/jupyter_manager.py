import jupyter_client
import queue

class KernelManager:
    def __init__(self):
        self.kernels = {}

    def execute(self, project_id, code):
        if project_id not in self.kernels:
            km = jupyter_client.KernelManager(kernel_name='python3')
            km.start_kernel()
            kc = km.client()
            kc.start_channels()
            self.kernels[project_id] = (km, kc)
        
        _, kc = self.kernels[project_id]
        kc.execute(code)
        # (Simplified retrieval logic)
        return "Code executed on persistent kernel."

kernel_service = KernelManager()
