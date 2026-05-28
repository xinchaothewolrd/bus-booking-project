import RouteStop from "../models/RouteStop.js";
import Route from "../models/Route.js";

// Lấy tất cả stops theo routeId
export const getRouteStopsByRouteId = async (req, res) => {
  try {
    const { routeId } = req.params; // lấy từ URL /api/routes/:routeId/stops

    if (!routeId) {
      return res.status(400).json({ message: "Thiếu routeId." });
    }

    const stops = await RouteStop.findAll({
      where: { routeId },
      order: [["stopOrder", "ASC"]],
    });

    if (!stops || stops.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy điểm dừng cho routeId này." });
    }

    return res.status(200).json(stops);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách stops theo routeId:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};


export const getAllRouteStops = async (req, res) => {
  try {
    const where = {};
    if (req.query.routeId) where.routeId = req.query.routeId;
    const stops = await RouteStop.findAll({ where, order: [["stopOrder", "ASC"]] });
    return res.status(200).json(stops);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách stops:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Lấy 1 stop theo id
export const getRouteStopById = async (req, res) => {
  try {
    const stop = await RouteStop.findByPk(req.params.id);
    if (!stop) return res.status(404).json({ message: "Không tìm thấy điểm dừng." });
    return res.status(200).json(stop);
  } catch (error) {
    console.error("Lỗi khi lấy điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Tạo mới 1 stop
export const createRouteStop = async (req, res) => {
  try {
    const { routeId, stopName, address, stopType, stopOrder, arriveOffsetMinutes } = req.body;
    if (!routeId || !stopName || stopOrder === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (routeId, stopName, stopOrder)." });
    }

    // Kiểm tra route tồn tại (không bắt buộc nhưng hữu ích)
    const route = await Route.findByPk(routeId);
    if (!route) return res.status(404).json({ message: "Không tìm thấy tuyến đường cho routeId này." });

    const newStop = await RouteStop.create({
      routeId,
      stopName,
      address,
      stopType,
      stopOrder,
      arriveOffsetMinutes,
    });

    return res.status(201).json({ message: "Đã tạo điểm dừng thành công.", data: newStop });
  } catch (error) {
    console.error("Lỗi khi tạo điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Cập nhật stop
export const updateRouteStop = async (req, res) => {
  try {
    const stop = await RouteStop.findByPk(req.params.id);
    if (!stop) return res.status(404).json({ message: "Không tìm thấy điểm dừng." });

    const { stopName, address, stopType, stopOrder, arriveOffsetMinutes } = req.body;
    await stop.update({ stopName, address, stopType, stopOrder, arriveOffsetMinutes });

    return res.status(200).json({ message: "Đã cập nhật điểm dừng.", data: stop });
  } catch (error) {
    console.error("Lỗi khi cập nhật điểm dừng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Xóa stop
export const deleteRouteStop = async (req, res) => {
  try {
    const stop = await RouteStop.findByPk(req.params.id);
    if (!stop) return res.status(404).json({ message: "Không tìm thấy điểm dừng." });

    await stop.destroy();
    return res.status(200).json({ message: "Đã xóa điểm dừng." });
  } catch (error) {
    console.error("Lỗi khi xóa điểm dừng:", error);
    return res.status(500).json({ message: "Không thể xóa điểm dừng do nó đang được sử dụng." });
  }
};
