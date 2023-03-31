import express from "express";
const router = express.Router();
import eksctl from "../../../src/utilities/eksctl.js";

router.get("/", async (req, res) => {
  try {
    const region = await eksctl.getRegion();
    const clusterUrl = `https://${region}.console.aws.amazon.com/eks/home?region=${region}#/clusters/edamame`;
    res.send(clusterUrl);
  } catch (error) {
    res.status(503).json({
      message: "Error getting the EKS cluster URL",
      error: error.message,
    });
  }
});

export default router;
