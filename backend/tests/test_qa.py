from app.llm.response_formatter import generate_follow_ups

def test_follow_ups_auth():
    answer = "This function handles authentication via JWT"
    follow_ups = generate_follow_ups(answer)
    assert any("route" in q.lower() or "auth" in q.lower() for q in follow_ups)