
from unsloth import FastLanguageModel
from Model import Model
import torch
import re

class Gemma(Model):

    def __init__(self, language: str, hf_token: str = None):

        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name = "lm-spell/gemma-2-9b-ft-ssc",
            # model_name = "unsloth/gemma-2-9b-bnb-4bit",
            max_seq_length = 2048,
            dtype = None,
            load_in_4bit = True,
            attn_implementation = "flash_attention_2",
            random_state = 42,
            token = hf_token,
        )

        model = FastLanguageModel.get_peft_model(
            model,
            r = 8,
            target_modules = ["q_proj", "k_proj", "v_proj", "o_proj","gate_proj", "up_proj", "down_proj"],
            lora_alpha = 16,
            lora_dropout = 0,
            bias = "none",
            use_gradient_checkpointing = "unsloth",
            random_state = 42,
            use_rslora = False,
            loftq_config = None,
        )

        self.model = model
        self.tokenizer = tokenizer
        self.PROMPT = f"""You are an expert {language} spell corrector. Below is a sentence in {language} language. It may or may not have a spelling mistake. Give the corrected output in {language}.

        ### Text:
        {{}}

        ### Output:
        {{}}"""

    def correct(self, text: str):
        
        FastLanguageModel.for_inference(self.model)
        
        inputs = self.tokenizer(
            [self.PROMPT.format(text, "")],
            return_tensors="pt"
        ).to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

        outputs = self.model.generate(**inputs, max_new_tokens=2048, do_sample=True, use_cache=True)

        pred_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)        

        match = re.search(r'### Output:\s*([^\n]+)', pred_text)
        output_text = match.group(1).strip() if match else None

        return output_text
