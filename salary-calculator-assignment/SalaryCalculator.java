/**
 * Interface SalaryCalculator (SalaryCaculator)
 * Định nghĩa dịch vụ tính lương cho các loại nhân viên khác nhau.
 */
public interface SalaryCalculator {

    /**
     * Tính và trả về lương của nhân viên.
     * Công thức: Lương cơ bản + (Số giờ làm thêm * Đơn giá làm thêm)
     *
     * @return tổng lương của nhân viên
     */
    double getSalary();
}
