from dotenv import load_dotenv
from Models.Gemma import Gemma
from Models.Mt5 import Mt5
import os

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path)

class LmSpell:

    def __init__(self, language: str = 'sinhala', model_label: str = 'gemma-2-9b'):
        self.language = language
        self.model_label = model_label

        hf_token = os.getenv("HF_TOKEN")

        if self.model_label == 'gemma-2-9b':
            self.model = Gemma(language, hf_token)
        elif self.model_label == 'mt5':
            self.model = Mt5(language, hf_token)

    def correct(self, text: str):
        return self.model.correct(text)






