import RouteStop from "../models/RouteStop.js";
import Route from "../models/Route.js";

// Lấy danh sách điểm dừng (có thể lọc theo routeId)
export const getRouteStops = async (req, res) => {
  try {
    const { routeId } = req.query;
    const filter = routeId ? { routeId } : {};

    const routeStops = await RouteStop.findAll({
      where: filter,
      include: [{ model: Route, as: "route" }],
      order: [["routeId", "ASC"], ["stopOrder", "ASC"]],
    });
    return res.status(200).json(routeStops);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Lấy 1 điểm dừng theo ID
export const getRouteStopById = async (req, res) => {
  try {
    const routeStop = await RouteStop.findByPk(req.params.id, {
      include: [{ model: Route, as: "route" }],
    });
    if (!routeStop) {
      return res.status(404).json({ message: "Không tìm thấy điểm dừng này." });
    }
    return res.status(200).json(routeStop);
  } catch (error) {
    console.error("Lỗi khi lấy điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Thêm mới 1 điểm dừng
export const createRouteStop = async (req, res) => {
  try {
    const { routeId, stopName, address, stopType, stopOrder, arriveOffsetMinutes } = req.body;
    
    // Kiểm tra xem tuyến đường có tồn tại không
    const route = await Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({ message: "Tuyến đường không tồn tại." });
    }

    const newRouteStop = await RouteStop.create({
      routeId,
      stopName,
      address,
      stopType,
      stopOrder,
      arriveOffsetMinutes,
    });

    return res.status(201).json({ message: "Thêm điểm dừng thành công.", routeStop: newRouteStop });
  } catch (error) {
    console.error("Lỗi khi thêm điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Cập nhật điểm dừng
export const updateRouteStop = async (req, res) => {
  try {
    const routeStop = await RouteStop.findByPk(req.params.id);
    if (!routeStop) {
      return res.status(404).json({ message: "Không tìm thấy điểm dừng này." });
    }

    await routeStop.update(req.body);
    return res.status(200).json({ message: "Cập nhật thành công.", routeStop });
  } catch (error) {
    console.error("Lỗi khi cập nhật điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Xóa điểm dừng
export const deleteRouteStop = async (req, res) => {
  try {
    const routeStop = await RouteStop.findByPk(req.params.id);
    if (!routeStop) {
      return res.status(404).json({ message: "Không tìm thấy điểm dừng này." });
    }

    await routeStop.destroy();
    return res.status(200).json({ message: "Xóa điểm dừng thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};
