from abc import ABC, abstractmethod

class Model(ABC):

    """
    This will be redundant when the LM Spell Library is released.
    """

    @abstractmethod
    def __init__(self, language: str, hf_token: str = None):
        pass

    @abstractmethod
    def correct(self, text):
        pass

