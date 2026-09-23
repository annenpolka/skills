Executor self-report (holdout H, iter-6 snapshot). 6/6 ○; parent verified run prompt has no {..}/［任意］ and no Claude-specific lines. Accuracy 100% vs recent average 100% → no overfitting drop. Trace: all OK. Retries: 0. tool_uses 5, 129s.
Unclear points (genuine skill defects exposed by the unseen domain):
1. Skill/prompt domain row put "現行版" (the artefact itself) as top rung, contradicting "最上段は目標の水準/外部の実物". GFR: ladder rows never contain the artefact's own version; show an external top rung.
2. Dev vs held-out task sets and where symptoms come from were unspecified. GFR: symptoms from dev set, verdict/position from held-out set; seal held-out mechanically.
3. Template line "サブエージェントを使う" unfit for codex exec. GFR: independence line names both sub-agent and separate-process CLI.
4. Plateau default 3 vs short budget (2h). Minor; not patched.
Fill-ins: commitlint human messages as top; rung 1 bare+one-line; 40 tasks dev16/holdout24; win definition; reproducibility thresholds; plateau 2; budget split; 3 new floor scripts; claude -p as other-family critic.
