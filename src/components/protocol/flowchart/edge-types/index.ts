import type { EdgeTypes } from "reactflow";
import { OrthogonalEdge } from "./orthogonal-edge";

export const customEdgeTypes: EdgeTypes = {
  orthogonal: OrthogonalEdge,
};
