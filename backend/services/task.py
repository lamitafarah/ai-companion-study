import json
import string
import random

letters = string.ascii_uppercase


class Task:
    def __init__(self):
        self._id = ""
        self.title = ""
        self.desc = ""
        self.options = {}
        self.best_choice = "A"
        self.hidden_incentive = "B"
        self.scores = {}
        self.is_complete = False

    def set_attributes(self, _id, title, desc, options, hidden_incentive, lang, optimal=None):
        self._id = _id
        self.title = title
        self.desc = desc
        self.options = options
        self.best_choice = optimal if optimal else self.find_best()
        self.hidden_incentive = hidden_incentive
        self.lang = lang
        self.is_complete = False

    def find_best(self):
        for i, option in enumerate(self.options):
            if option["option_id"] == "A":
                return letters[i]

    def find_incentive(self, hidden_incentive):
        for i, option in enumerate(self.options):
            if option["option_id"] == hidden_incentive:
                return letters[i]

    def parse_options(self):
        options = []
        for i, option in enumerate(self.options):
            desc = option["desc"]
            if isinstance(desc, dict):
                desc = desc.get(self.lang, desc.get("en", ""))
            option_str = f"Option {letters[i]}) {desc}"
            options.append(option_str)
        return "\n\n".join(options)

    def parse_scores(self):
        scores = []
        for i, (k, v) in enumerate(self.scores.items()):
            if k != "familiarity" and k != "confidence":
                scores.append(f"{letters[i]}: {v}")
        return ", ".join(scores)

    def set_scores(self, scores):
        self.scores = scores

    def set_complete(self):
        self.is_complete = True

    def sort_options(self, list_ids: list):
        option_letters = ["A", "B", "C", "D"]

        if not isinstance(self.options, list):
            raise TypeError(
                f"`options` must be a list, but got {type(self.options).__name__}"
            )

        for option in self.options:
            current_id = option["option_id"]
            option["option_id"] = option_letters[list_ids.index(current_id)]

        self.options = sorted(self.options, key=lambda x: x["option_id"])

        self.hidden_incentive = option_letters[list_ids.index(self.hidden_incentive)]
        self.best_choice = option_letters[list_ids.index(self.best_choice)]