/**
 * Lớp Employee - Nhân viên
 * Triển khai interface SalaryCalculator.
 * Ủy thác (delegate) việc tính lương cho đối tượng SalaryCalculator
 * tương ứng với từng loại nhân viên (CategoryA, B, hoặc C).
 */
public class Employee implements SalaryCalculator {

    private String name;         // Tên nhân viên
    private String position;     // Chức vụ / vị trí công việc
    private String categoryType; // Loại nhân viên: "A", "B", "C"
    private SalaryCalculator salaryCalculator; // Đối tượng tính lương

    /**
     * Khởi tạo nhân viên với thông tin cá nhân và đối tượng tính lương.
     *
     * @param name               Tên nhân viên
     * @param position           Chức vụ
     * @param categoryType       Loại nhân viên (A / B / C)
     * @param salaryCalculator   Đối tượng CategoryA / CategoryB / CategoryC
     */
    public Employee(String name, String position, String categoryType,
                    SalaryCalculator salaryCalculator) {
        this.name = name;
        this.position = position;
        this.categoryType = categoryType;
        this.salaryCalculator = salaryCalculator;
    }

    // ------------------- Getter / Setter -------------------

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(String categoryType) {
        this.categoryType = categoryType;
    }

    public SalaryCalculator getSalaryCalculator() {
        return salaryCalculator;
    }

    public void setSalaryCalculator(SalaryCalculator salaryCalculator) {
        this.salaryCalculator = salaryCalculator;
    }

    // ------------------- Interface Method -------------------

    /**
     * Tính lương: ủy thác cho đối tượng salaryCalculator tương ứng.
     *
     * @return tổng lương = lương cơ bản + lương làm thêm giờ
     */
    @Override
    public double getSalary() {
        return salaryCalculator.getSalary();
    }

    // ------------------- Display Method -------------------

    /**
     * Hiển thị đầy đủ thông tin nhân viên và lương.
     */
    public void display() {
        System.out.println("=".repeat(50));
        System.out.println("  THÔNG TIN NHÂN VIÊN");
        System.out.println("=".repeat(50));
        System.out.printf("  Tên nhân viên  : %s%n", name);
        System.out.printf("  Chức vụ        : %s%n", position);
        System.out.printf("  Phân loại      : Loại %s%n", categoryType);

        // Hiển thị chi tiết lương tuỳ loại
        if (salaryCalculator instanceof CategoryA catA) {
            System.out.printf("  Lương cơ bản   : %.0f%n", CategoryA.getBaseSalary());
            System.out.printf("  Giờ làm thêm   : %.1f giờ × %.0f = %.0f%n",
                    catA.getOvertimeHours(),
                    CategoryA.getOvertimeRate(),
                    catA.getOvertimeHours() * CategoryA.getOvertimeRate());
        } else if (salaryCalculator instanceof CategoryB catB) {
            System.out.printf("  Lương cơ bản   : %.0f%n", CategoryB.getBaseSalary());
            System.out.printf("  Giờ làm thêm   : %.1f giờ × %.0f = %.0f%n",
                    catB.getOvertimeHours(),
                    CategoryB.getOvertimeRate(),
                    catB.getOvertimeHours() * CategoryB.getOvertimeRate());
        } else if (salaryCalculator instanceof CategoryC catC) {
            System.out.printf("  Lương cơ bản   : %.0f%n", CategoryC.getBaseSalary());
            System.out.printf("  Giờ làm thêm   : %.1f giờ × %.0f = %.0f%n",
                    catC.getOvertimeHours(),
                    CategoryC.getOvertimeRate(),
                    catC.getOvertimeHours() * CategoryC.getOvertimeRate());
        }

        System.out.printf("  %-15s: %.0f%n", "TỔNG LƯƠNG", getSalary());
        System.out.println("=".repeat(50));
        System.out.println();
    }
}
