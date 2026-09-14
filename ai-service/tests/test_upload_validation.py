import pytest
from fastapi import UploadFile, HTTPException
from io import BytesIO
from app.main import validate_upload_file, sanitize_filename


@pytest.mark.anyio
async def test_sanitize_filename_traversal():
    # Attempt directory traversal attacks
    unsafe_name = "../../etc/passwd.pdf"
    clean = sanitize_filename(unsafe_name)
    assert "/" not in clean
    assert ".." not in clean
    assert clean == "passwd.pdf"

    windows_unsafe = "..\\..\\windows\\system32\\calc.pdf"
    clean_win = sanitize_filename(windows_unsafe)
    assert "\\" not in clean_win
    assert ".." not in clean_win
    assert clean_win == "calc.pdf"


@pytest.mark.anyio
async def test_validate_upload_allowed_extensions():
    # PDF is allowed
    pdf_file = UploadFile(filename="specification.pdf", file=BytesIO(b"%PDF-1.4 test content"))
    content = await validate_upload_file(pdf_file)
    assert content.startswith(b"%PDF")

    # Disallowed extension: .exe or .sh
    bad_file = UploadFile(filename="malicious.exe", file=BytesIO(b"MZ12345"))
    with pytest.raises(HTTPException) as exc_info:
        await validate_upload_file(bad_file)
    assert exc_info.value.status_code == 400
    assert "not permitted" in exc_info.value.detail


@pytest.mark.anyio
async def test_validate_upload_size_limit():
    # Oversized content > 50MB
    oversized_bytes = b"0" * (50 * 1024 * 1024 + 10)
    oversized_file = UploadFile(filename="massive.pdf", file=BytesIO(oversized_bytes))
    with pytest.raises(HTTPException) as exc_info:
        await validate_upload_file(oversized_file)
    assert exc_info.value.status_code == 400
    assert "exceeds maximum allowed upload size" in exc_info.value.detail
