# ָ��Ҫ�����ĸ�Ŀ¼
$rootDirectory = "D:\Coding"

# ��ȡָ��Ŀ¼�µ�������Ŀ¼
$subdirectories = Get-ChildItem -Path $rootDirectory -Directory

# ����ÿ����Ŀ¼��ִ������
foreach ($subdir in $subdirectories) {
    Set-Location -Path $subdir.FullName
    Write-Host ">>>> Current Directory: $(Get-Location)"
    git status
}