import assert from "node:assert";
import { test } from "node:test";
import {
  getLevelFromXp,
  getXpForNextLevel,
  checkStageTransition,
  LEVEL_TABLE,
  STAGE_XP_REWARDS,
  STAGE_SCALE,
} from "../backend/shared/growth.config";

test("getLevelFromXp calculates correct levels and stages", () => {
  assert.deepStrictEqual(getLevelFromXp(0), { level: 1, stage: "baby" });
  assert.deepStrictEqual(getLevelFromXp(24), { level: 1, stage: "baby" });
  assert.deepStrictEqual(getLevelFromXp(25), { level: 2, stage: "baby" });
  assert.deepStrictEqual(getLevelFromXp(110), { level: 5, stage: "baby" });
  assert.deepStrictEqual(getLevelFromXp(149), { level: 5, stage: "baby" });
  assert.deepStrictEqual(getLevelFromXp(150), { level: 6, stage: "teen" });
  assert.deepStrictEqual(getLevelFromXp(1499), { level: 15, stage: "teen" });
  assert.deepStrictEqual(getLevelFromXp(1500), { level: 16, stage: "adult" });
  assert.deepStrictEqual(getLevelFromXp(5700), { level: 30, stage: "adult" });
  assert.deepStrictEqual(getLevelFromXp(6000), { level: 31, stage: "adult" });
  assert.deepStrictEqual(getLevelFromXp(26700), { level: 100, stage: "adult" });
  assert.deepStrictEqual(getLevelFromXp(99999), { level: 100, stage: "adult" });
});

test("checkStageTransition detects transitions accurately", () => {
  assert.deepStrictEqual(checkStageTransition(120, 135), { transitioned: false });
  assert.deepStrictEqual(checkStageTransition(135, 150), { transitioned: true, from: "baby", to: "teen" });
  assert.deepStrictEqual(checkStageTransition(1400, 1500), { transitioned: true, from: "teen", to: "adult" });
  assert.deepStrictEqual(checkStageTransition(2000, 2300), { transitioned: false });
});

test("getXpForNextLevel calculates remaining XP correctly", () => {
  assert.strictEqual(getXpForNextLevel(0), 25);
  assert.strictEqual(getXpForNextLevel(25), 25);
  assert.strictEqual(getXpForNextLevel(150), 150);
  assert.strictEqual(getXpForNextLevel(26700), 0);
});

test("Configuration constants are defined", () => {
  assert.strictEqual(LEVEL_TABLE.length, 30);
  assert.strictEqual(STAGE_SCALE.baby, 0.55);
  assert.strictEqual(STAGE_SCALE.teen, 1.0);
  assert.strictEqual(STAGE_SCALE.adult, 1.5);
  assert.strictEqual(STAGE_XP_REWARDS.baby.dailyLoginXp, 15);
  assert.strictEqual(STAGE_XP_REWARDS.teen.dailyLoginXp, 30);
  assert.strictEqual(STAGE_XP_REWARDS.adult.dailyLoginXp, 40);
});
