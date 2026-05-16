import java.util.ArrayList;
import java.util.List;

/**
 * MainApp - Lớp thực thi chính
 * Minh họa hệ thống tính lương cho các loại nhân viên khác nhau
 * trong một doanh nghiệp phần mềm.
 *
 * Công thức tính lương:
 *   Tổng lương = Lương cơ bản + (Số giờ làm thêm × Đơn giá/giờ)
 *
 * Phân loại:
 *   - Loại A: cơ bản 2000, làm thêm 15/giờ  (Lập trình, Thiết kế, Tư vấn)
 *   - Loại B: cơ bản 1500, làm thêm 10/giờ  (Bán hàng, Kế toán, Kiểm chứng)
 *   - Loại C: cơ bản  800, làm thêm  5/giờ  (Nhân viên bán hàng, Tiếp thị)
 */
public class MainApp {

    public static void main(String[] args) {

        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════╗");
        System.out.println("║     HỆ THỐNG TÍNH LƯƠNG NHÂN VIÊN               ║");
        System.out.println("║     Doanh Nghiệp Phần Mềm ABC                   ║");
        System.out.println("╚══════════════════════════════════════════════════╝");
        System.out.println();

        // Danh sách nhân viên
        List<Employee> employees = new ArrayList<>();

        // ── Loại A ─────────────────────────────────────────
        employees.add(new Employee(
                "Nguyễn Văn An",
                "Lập trình viên",
                "A",
                new CategoryA(10.0)   // 10 giờ làm thêm
        ));

        employees.add(new Employee(
                "Trần Thị Bình",
                "Thiết kế giao diện",
                "A",
                new CategoryA(5.0)    // 5 giờ làm thêm
        ));

        employees.add(new Employee(
                "Lê Văn Cường",
                "Tư vấn giải pháp",
                "A",
                new CategoryA(8.0)    // 8 giờ làm thêm
        ));

        // ── Loại B ─────────────────────────────────────────
        employees.add(new Employee(
                "Phạm Thị Dung",
                "Đại diện bán hàng",
                "B",
                new CategoryB(12.0)   // 12 giờ làm thêm
        ));

        employees.add(new Employee(
                "Hoàng Văn Em",
                "Kế toán",
                "B",
                new CategoryB(6.0)    // 6 giờ làm thêm
        ));

        employees.add(new Employee(
                "Vũ Thị Phượng",
                "Nhân viên kiểm chứng",
                "B",
                new CategoryB(4.0)    // 4 giờ làm thêm
        ));

        // ── Loại C ─────────────────────────────────────────
        employees.add(new Employee(
                "Đặng Văn Giang",
                "Nhân viên bán hàng",
                "C",
                new CategoryC(20.0)   // 20 giờ làm thêm
        ));

        employees.add(new Employee(
                "Ngô Thị Hoa",
                "Nhân viên tiếp thị",
                "C",
                new CategoryC(15.0)   // 15 giờ làm thêm
        ));

        // ── Hiển thị thông tin và lương của từng nhân viên ──
        for (Employee emp : employees) {
            emp.display();
        }

        // ── Thống kê tổng kết ──────────────────────────────
        System.out.println("╔══════════════════════════════════════════════════╗");
        System.out.println("║                THỐNG KÊ TỔNG KẾT                ║");
        System.out.println("╚══════════════════════════════════════════════════╝");

        double totalSalary = 0;
        System.out.printf("%-5s %-22s %-12s %10s%n",
                "STT", "Tên nhân viên", "Loại", "Lương");
        System.out.println("-".repeat(55));

        int stt = 1;
        for (Employee emp : employees) {
            System.out.printf("%-5d %-22s %-12s %,10.0f%n",
                    stt++,
                    emp.getName(),
                    "Loại " + emp.getCategoryType(),
                    emp.getSalary());
            totalSalary += emp.getSalary();
        }

        System.out.println("-".repeat(55));
        System.out.printf("%-40s %,10.0f%n", "TỔNG LƯƠNG TOÀN CÔNG TY:", totalSalary);
        System.out.printf("%-40s %,10.0f%n", "LƯƠNG TRUNG BÌNH:",
                totalSalary / employees.size());
        System.out.println("=".repeat(55));
        System.out.println();
    }
}
