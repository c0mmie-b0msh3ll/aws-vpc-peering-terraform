# Yêu cầu
- Có account aws (ACCESS_KEY & CREDENTIAL_KEY)
- Install aws-cli
- Setup aws-cli
- Instal terraform

# Command

| Command             | Mục đích                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terraform init`    | Khởi tạo project Terraform, tải provider AWS và module. Chỉ chạy 1 lần trước khi deploy.                                                          |
| `terraform plan`    | Hiển thị **tất cả resources sẽ tạo**, kiểm tra CIDR, AZ, subnet, route tables… trước khi apply.                                                   |
| `terraform apply`   | Triển khai resources lên AWS. Terraform sẽ hỏi `Do you want to perform these actions?` → gõ `yes`.                                                |
| `terraform destroy` | Xóa toàn bộ resources đã tạo bởi Terraform. **Chú ý:** nếu có resource bạn chỉnh sửa thủ công ngoài Terraform → Terraform sẽ báo lỗi khi destroy. |

