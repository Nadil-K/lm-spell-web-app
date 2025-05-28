from Models.Model import Model
import torch
import re

class Mt5(Model):

    def __init__(self, language: str, hf_token: str = None):
        from transformers import MT5ForConditionalGeneration, T5TokenizerFast

        model_path = "lm-spell/mt5-base-ft-ssc"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MT5ForConditionalGeneration.from_pretrained(model_path, token=hf_token).to(self.device)
        self.tokenizer = T5TokenizerFast.from_pretrained("google/mt5-base")
        self.tokenizer.add_special_tokens({'additional_special_tokens': ['<ZWJ>']})
        
    def correct(self, text: str):

        self.model.eval()

        text = re.sub(r'\u200d', '<ZWJ>', text)
        inputs = self.tokenizer(text, return_tensors='pt', padding='max_length', truncation=True, max_length=128)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model.generate(input_ids=inputs["input_ids"], attention_mask=inputs["attention_mask"])
            prediction = outputs[0]

        special_token_id_to_keep = self.tokenizer.convert_tokens_to_ids('<ZWJ>')
        all_special_ids = torch.tensor(self.tokenizer.all_special_ids, dtype=torch.int64).to(self.device)
        special_token_tensor = torch.tensor([special_token_id_to_keep], dtype=torch.int64).to(self.device)

        pred_tokens = prediction.to(self.device)
        tokens_tensor = pred_tokens.clone().detach().to(dtype=torch.int64)
        mask = (tokens_tensor == special_token_tensor) | (~torch.isin(tokens_tensor, all_special_ids))
        filtered_tokens = tokens_tensor[mask].tolist()
        
        prediction_decoded = self.tokenizer.decode(filtered_tokens, skip_special_tokens=False).replace('\n', '').strip()
        
        return re.sub(r'<ZWJ>\s?', '\u200d', prediction_decoded)
    

