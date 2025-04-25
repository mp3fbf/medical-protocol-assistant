## 1. End‑to‑end workflow (who runs what, when)

| Phase | Responsible Prompt | Primary Output | When to move on |
|-------|-------------------|----------------|-----------------|
| **Idea → Structured Request** | **Request Prompt** | Versioned, checkbox‑driven *Request* doc | You check *Acceptance Checklist ✓* |
| **Request → Tech Spec** | **Spec Prompt** | Single‑source‑of‑truth *Technical Specification* | Spec looks complete; open questions are minimal |
| **Spec → Task Backlog** | **Planner Prompt** | Atomic, ordered *Implementation Plan* (≤20 files/step) | Plan reviewed; no glaring dependency holes |
| **Build Loop** | **Codegen Prompt** *(iterative)* | Working code + tests, 1 step at a time | CI green; milestone feature complete |
| **Quality Gate** | **Review Prompt** | Optimization‑Plan checklist | Major items resolved or scheduled |
| **Security Gate** | **Security Audit Prompt** | Security‑Fix Plan | All P0/P1 issues fixed or accepted |
| **Release Engineering** | **Release & Deployment Prompt** | IaC, CI/CD, rollout & DR playbooks | Staging deploy passes smoke tests |
| **Go‑Live & Post‑Launch** | Manual + optional add‑on prompts (see §3) | Production release, monitoring dashboards | KPIs healthy for agreed bake time |

## 2. Step‑by‑step execution guide

1. **Kick‑off with the Request Prompt**  
   *—You and the PM/business stakeholder iterate until every checkbox in “Acceptance Checklist” is done.*

2. **Run the Spec Prompt once**  
   *—Produces a frozen Technical Spec. Sign‑off here saves re‑work later.*

3. **Generate the Implementation Plan**  
   *—Planner breaks work into atomic steps with Effort/Risk labels.*

4. **Start the Codegen loop**  
   *—For each unchecked step:*  
   &nbsp;&nbsp;1. Codegen agent writes/updates ≤ 20 files.  
   &nbsp;&nbsp;2. CI runs automatically.  
   &nbsp;&nbsp;3. If green, mark the step complete and commit.  

5. **Periodic Review Prompt**  
   *—Run after a major feature group merges (e.g., auth flow, payments). Fix high‑priority items immediately.*

6. **Mid‑build Security Audit Prompt**  
   *—Once auth + first data store are in place. Patch P0/P1 issues.*

7. **Continue Codegen → Review loops** until spec is fully implemented, CI/lint/tests are all green.

8. **Final Security Audit Prompt**  
   *—Should return “NO SECURITY ISSUES FOUND” or a tiny fix list.*

9. **Performance Benchmark Prompt (optional but recommended)**  
   *—Stress test; integrate fixes.*

10. **Run Release & Deployment Prompt**  
    *—Generates Terraform / GitHub Actions, blue‑green script, DR plan.*

11. **Deploy to staging**  
    *—Smoke test manually or via Playwright scripts.*

12. **Promote to production**  
    *—Follow the Release Plan’s approval gate. Monitor. Roll back if SLOs fail.*

13. **Post‑launch add‑ons**  
    *—Observability tuning, dependency bot, doc generation.*

---

## 3. Quick checklist before you start

- [ ] All prompts saved in a shared doc/snippet manager  
- [ ] Team agrees on **when** each prompt is invoked (add to README)  
- [ ] CI baseline pipeline already running (lint + tests)  
- [ ] Git branching convention (e.g., trunk‑based or Git‑flow) decided  
- [ ] Secrets store (Vault / AWS SM / Doppler) chosen and access granted  
- [ ] Slack/Teams channel hooked to CI & alert webhooks for visibility  

Checking these boxes means you can kick off **Request v1** today and flow all the way to prod without process gaps.

---