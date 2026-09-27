import { afterEach, vi } from "vitest";
import { carrierRequest, resetCarrier } from "./carrier.js";

// Replace the carrier HTTP adapter; tests queue responses with carrier().
vi.mock("../utils/apiRequest.js", () => ({ default: carrierRequest }));

afterEach(resetCarrier);
