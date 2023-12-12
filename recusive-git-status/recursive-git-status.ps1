# 指定要遍历的根目录
$rootDirectory = "D:\Coding"

# 获取指定目录下的所有子目录
$subdirectories = Get-ChildItem -Path $rootDirectory -Directory

# 遍历每个子目录并执行命令
foreach ($subdir in $subdirectories) {
    Set-Location -Path $subdir.FullName
    Write-Host ">>>> Current Directory: $(Get-Location)"
    git status
}