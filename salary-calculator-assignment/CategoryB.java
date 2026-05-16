/**
 * CategoryB - Loại B
 * Áp dụng cho: Đại diện bán hàng, Quản lý bán hàng, Kế toán, Nhân viên kiểm chứng
 * Lương cơ bản: 1500
 * Tăng giờ: 10/giờ
 */
public class CategoryB implements SalaryCalculator {

    private static final double BASE_SALARY    = 1500.0;
    private static final double OVERTIME_RATE  = 10.0;

    private double overtimeHours;

    public CategoryB(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    /**
     * Tính lương: 1500 + (số giờ làm thêm × 10)
     */
    @Override
    public double getSalary() {
        return BASE_SALARY + (overtimeHours * OVERTIME_RATE);
    }

    public static double getBaseSalary() {
        return BASE_SALARY;
    }

    public static double getOvertimeRate() {
        return OVERTIME_RATE;
    }
}
