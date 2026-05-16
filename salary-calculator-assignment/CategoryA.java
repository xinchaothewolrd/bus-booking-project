/**
 * CategoryA - Loại A
 * Áp dụng cho: Lập trình viên, Thiết kế, Tư vấn
 * Lương cơ bản: 2000
 * Tăng giờ: 15/giờ
 */
public class CategoryA implements SalaryCalculator {

    private static final double BASE_SALARY    = 2000.0;
    private static final double OVERTIME_RATE  = 15.0;

    private double overtimeHours;

    public CategoryA(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public double getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(double overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    /**
     * Tính lương: 2000 + (số giờ làm thêm × 15)
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
