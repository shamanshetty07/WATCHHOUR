import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $count: "totalSubscribers",
    },
  ]);

  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $count: "totalVideos",
    },
  ]);

  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
      },
    },
    {
      $match: {
        "likedVideo.owner": new mongoose.Types.ObjectId(String(channelId)),
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  const stats = {
    totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
    totalVideos: totalVideos[0]?.totalVideos || 0,
    totalViews: totalViews[0]?.totalViews || 0,
    totalLikes: totalLikes[0]?.totalLikes || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({
    owner: req.user?._id,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
