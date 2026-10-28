// routes/expenses.js
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const expenseStore = require("../store/expenseStore");
const blueprintStore = require("../store/blueprintStore");

const router = express.Router();
router.use(requireAuth);

// GET /api/expenses/:blueprintId — anyone with view access to the project
// (admin, owning builder, or assigned client) can see the numbers.
router.get("/:blueprintId", (req, res) => {
  try {
    const blueprintId = Number(req.params.blueprintId);
    const blueprint = blueprintStore.findViewable(blueprintId, req.user);
    if (!blueprint) return res.status(404).json({ error: "Project not found." });

    const expenses = expenseStore.listForBlueprint(blueprintId);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      expenses,
      totalSpent,
      budgetedTotal: blueprint.analysis?.cost?.totalEstimate ?? null,
      canEdit: blueprintStore.canManage(blueprint, req.user),
    });
  } catch (err) {
    console.error("[GET /api/expenses/:blueprintId]", err);
    res.status(500).json({ error: "Something went wrong loading expenses." });
  }
});

// POST /api/expenses/:blueprintId — only the owning builder or admin logs
// spend; clients have read-only visibility into the budget.
router.post("/:blueprintId", (req, res) => {
  try {
    const blueprintId = Number(req.params.blueprintId);
    const blueprint = blueprintStore.findManageable(blueprintId, req.user);
    if (!blueprint) {
      return res.status(403).json({ error: "Only the project's builder or an admin can log expenses." });
    }

    const { category, amount, date, note } = req.body;
    if (!category || amount === undefined || amount === null || Number.isNaN(Number(amount))) {
      return res.status(400).json({ error: "Category and a valid amount are required." });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than zero." });
    }

    const expense = expenseStore.create({
      blueprintId,
      category,
      amount: Number(amount),
      date,
      note,
      loggedBy: req.user.name,
    });

    res.status(201).json({ expense });
  } catch (err) {
    console.error("[POST /api/expenses/:blueprintId]", err);
    res.status(500).json({ error: "Something went wrong saving that expense." });
  }
});

// DELETE /api/expenses/:blueprintId/:expenseId
router.delete("/:blueprintId/:expenseId", (req, res) => {
  try {
    const blueprintId = Number(req.params.blueprintId);
    const blueprint = blueprintStore.findManageable(blueprintId, req.user);
    if (!blueprint) {
      return res.status(403).json({ error: "Only the project's builder or an admin can delete expenses." });
    }

    const removed = expenseStore.remove(Number(req.params.expenseId), blueprintId);
    if (!removed) return res.status(404).json({ error: "Expense not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/expenses/:blueprintId/:expenseId]", err);
    res.status(500).json({ error: "Something went wrong deleting that expense." });
  }
});

module.exports = router;
