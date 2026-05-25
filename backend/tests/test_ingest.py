from app.parser.repo_cloner import get_repo_name

def test_get_repo_name():
    url = "https://github.com/tiangolo/fastapi"
    assert get_repo_name(url) == "fastapi"

def test_get_repo_name_with_git():
    url = "https://github.com/tiangolo/fastapi.git"
    assert get_repo_name(url) == "fastapi"