import { jest } from "@jest/globals";
import { authMe } from "../../src/controllers/userController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("userController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("authMe", () => {
    test("200 trả về thông tin user từ req.user", async () => {
      const req = { user: { id: 1, email: "test@example.com" } };
      const res = mockRes();
      await authMe(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: req.user });
    });

    test("500 nếu có lỗi xảy ra", async () => {
      // Giả lập lỗi bằng cách override res.json để ném lỗi
      const req = { user: { id: 1 } };
      const res = mockRes();
      res.json.mockImplementationOnce(() => { throw new Error("mock error"); });
      
      await authMe(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
