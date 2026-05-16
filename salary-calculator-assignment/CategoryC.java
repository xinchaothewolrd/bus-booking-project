/**
 * CategoryC - Loại C
 * Áp dụng cho: Nhân viên bán hàng, Nhân viên tiếp thị
 * Lương cơ bản: 800
 * Tăng giờ: 5/giờ
 */
public class CategoryC implements SalaryCalculator {

    private static final double BASE_SALARY    = 800.0;
    private static final double OVERTIME_RATE  = 5.0;

    private double overtimeHours;

    public CategoryC(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    /**
     * Tính lương: 800 + (số giờ làm thêm × 5)
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
