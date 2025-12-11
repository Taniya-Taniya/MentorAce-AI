# institution/comparison_service.py
from mentor.scoring_service import calculate_score, final_score

def compare_two(text1, text2):
    metrics1 = calculate_score(text1)
    metrics2 = calculate_score(text2)

    score1 = final_score(metrics1)
    score2 = final_score(metrics2)

    return {
        "mentor1": {"score": score1, "metrics": metrics1},
        "mentor2": {"score": score2, "metrics": metrics2}
    }
