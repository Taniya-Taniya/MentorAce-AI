def format_strengths(metrics):
    strengths = []
    if metrics.get("clarity", 0) > 70:
        strengths.append("Clarity in explanations")
    if metrics.get("depth", 0) > 70:
        strengths.append("Conceptual depth")
    if metrics.get("engagement", 0) > 70:
        strengths.append("Good engagement")

    return strengths or ["No strong areas identified"]
