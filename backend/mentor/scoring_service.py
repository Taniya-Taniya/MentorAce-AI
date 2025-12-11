import random

def score_transcript(transcript):
    # Very simple dynamic scoring so values actually change
    clarity = random.randint(60, 95)
    depth = random.randint(60, 95)
    engagement = random.randint(60, 95)
    pacing = random.randint(60, 95)

    metrics = {
        "clarity": clarity,
        "depth": depth,
        "engagement": engagement,
        "pacing": pacing
    }

    overall = round((clarity + depth + engagement + pacing) / 4)

    return overall, metrics
