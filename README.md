# SIS 2: Playwright tests for the Toolshop

Automated tests written with Playwright and TypeScript for https://practicesoftwaretesting.com.
5 test cases, 7 automated tests (details in [`Description.md`](Description.md)).

## CI

[![Playwright Tests](https://github.com/llcky8/Software-testing-and-debugging/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/llcky8/Software-testing-and-debugging/actions/workflows/playwright.yml)

GitHub Actions runs the suite alongside the repository and uses a job matrix to run four Playwright shards in parallel.

- [`playwright.yml`](.github/workflows/playwright.yml) runs on pushes and pull requests and defines a manual trigger.
- Each shard uses Node.js 22, the npm download cache, `npm ci`, and Chromium with its system dependencies. Together, the shards run the full suite.
- With `CI=true`, Playwright forbids `test.only`, uses two workers per shard and two retries, and writes list, blob, and JUnit reports. It records a trace on the first retry.
- The report job combines the shard blobs into HTML and JUnit reports, including when tests fail. The `playwright-report`, `junit-report`, and `test-results-N` artifacts are configured for 14 days. Intermediate blob artifacts are configured for one day.

### Verification

Push run #1 for commit `c3e5cc9` on `ci/playwright-pipeline` ran all four shards. On attempt 3, shards 3 and 4 passed, shards 1 and 2 failed, and **Merge reports** succeeded. GitHub listed 10 artifacts. [Push run #1](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44297976364)

Playwright traces show the same failure in the purchase test (`buy-product.spec.ts`, shard 1) and the valid-credentials login test (`login.spec.ts`, shard 2). After registration, the public Toolshop demo served Cloudflare's security verification page at `/auth/login`. Both tests timed out after 15 seconds waiting for the login email field. A separate test URL is currently unavailable.

The full Playwright suite passed locally against Toolshop Sprint 5 running in Docker at `http://localhost:4200` (7 passed). The local database was initialized with migrations and demo seed data.

The first GitHub Actions run with containerized Toolshop stopped before Playwright started. The prebuilt Nginx container exited with `exec format error`, leaving the catalog API unavailable on port 8091. The workflow now builds the web image from Toolshop's upstream Dockerfile on the runner. [Failed containerized push run](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44356776560)

The push run with the rebuilt Nginx image succeeded on its second attempt. All four Playwright shards passed and the merge job completed successfully. The first attempt was cancelled while the jobs were still running. [Successful push run, attempt 2](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44358986066/attempts/2)

Opening pull request #1 triggered a separate `pull_request` run. All four shards and the merge job passed. The shards started with an empty npm cache, and the merge job's `actions/setup-node@v4` step logged `Cache restored successfully`. The badge above targets `main`. Both verified runs used the feature branch changes. [Successful pull request run](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44362001857)

Screenshots: [push](screenshots/ci-push.png), [pull request](screenshots/ci-pr.png), [npm cache](screenshots/ci-cache.png), [artifacts](screenshots/ci-artifacts.png), and [local Toolshop run](screenshots/ci-toolshop-local.png). The public-site failure is visible in the [purchase trace](screenshots/ci-trace-purchase.png) and [login trace](screenshots/ci-trace-login.png).

### Playwright in Docker

The full suite also passed from the official Linux Playwright image `mcr.microsoft.com/playwright:v1.64.1-noble`, with `CI=true` and the local Toolshop as the target. The run reported **7 passed in 9.2 seconds** using two workers. [Docker run screenshot](screenshots/ci-docker.png)

### Runtime

| Configuration | Total GitHub Actions duration | Test step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 shard + report merge | 4 min 17 s | 12 s | [Push run #5](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44483171257) |
| 4 shards + report merge | 5 min 56 s | 8 s | [Push run #11](https://github.com/llcky8/Software-testing-and-debugging/actions/runs/44487986066) |

These are single measurements from successful push runs with the same Toolshop setup. Four shards shortened the longest Playwright test step by 4 s, while the full workflow took 1 min 39 s longer.

[One-shard run screenshot](screenshots/ci-runtime-push-1-shard.png) · [Four-shard run screenshot](screenshots/ci-runtime-push-4-shards.png)

#### Local estimate

Measured on my machine with `Measure-Command` (PowerShell). This is only a rough local reference; the numbers that compare the CI configurations come from GitHub Actions.

| Configuration | Command | Time |
| --- | --- | --- |
| 1 worker | `npx playwright test --workers=1` | 36.9 s |
| Default workers | `npx playwright test` | 15.0 s |

Running the tests in parallel workers makes the local run about 2.5 times faster.

## Requirements

- Node.js (tested on: `v24.15.0`)
- npm
- Internet access (the tests run against the public site)

## Install and run

```bash
git clone <link to this repository>
cd <repository folder>
npm install
npx playwright install chromium
npx playwright test
```

Expected result: `7 passed`.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run typecheck` | checks the TypeScript types without running the tests |
| `npx playwright test --ui` | UI mode: step through the tests |
| `npx playwright test --repeat-each=3 --fully-parallel` | runs every test 3 times in parallel to look for flaky tests |
| `npx playwright test tests/login.spec.ts` | runs one file |
| `npx playwright show-report` | opens the HTML report of the last run |

## What is covered

| # | File | What it proves |
| --- | --- | --- |
| 1 | `tests/register.spec.ts` | a new customer registers and is redirected to the login page |
| 2 | `tests/login.spec.ts` | a new user's login leads to `/account`; login with invalid credentials shows an error |
| 3 | `tests/buy-product.spec.ts` | a signed-in customer buys an in-stock product (Cash on Delivery) and sees the payment confirmation |
| 4 | `tests/compare-products.spec.ts` | name and price of two products on the detail page match the catalog |
| 5 | `tests/reset-password.spec.ts` | a reset for a known email shows a confirmation; a reset for an invalid email shows an error |

## Project structure

```
tests/        specs (one file per test case), no locators inside
pages/        page objects: base, login, register, product, cart, checkout
fixtures/     pages.fixture.ts: page objects and the loggedInCustomer fixture
data/         user.factory.ts: unique users and addresses
screenshots/  screenshots of the AI answers and of the test runs
playwright.config.ts
Description.md   list of test cases
Prompt.md        prompts used to generate the code
Review.md        how I reviewed and corrected the AI output
```

## Rules the code follows

- **Locators live only in page objects.** Specs contain no `getByTestId`, `locator` and so on; tests use page object methods and public locators. Locators are `getByTestId` (the `data-test` attribute), `getByRole` and `getByLabel`. No CSS and no XPath.
- **Assertions live only in specs.** Page objects contain no `expect`; tests assert on the public locators with web-first assertions (`await expect(locator)...`), which wait and retry on their own.
- **No `waitForTimeout`.** Waiting is done by Playwright assertions, `waitForURL`, and one `waitForFunction` in registration (waiting for the street to be autofilled).
- **Fixtures.** `fixtures/pages.fixture.ts` gives the tests their page objects (no `new` in specs) and the `loggedInCustomer` fixture, which registers a new user and signs in as that user.
- **Unique data and independence.** Every test creates its own user (`createUser()`), so the tests pass in any order and in parallel. The site's shared accounts are not used for logging in (they are public and can be locked).

## Configuration (`playwright.config.ts`)

- Chromium only.
- `testIdAttribute: 'data-test'`: the site uses this attribute, not `data-testid`.
- `timeout: 60_000`, `actionTimeout: 15_000`, `navigationTimeout: 45_000`.
- Local runs use Playwright's default worker count and zero retries. CI uses two workers per shard and two retries. A test that passes on a retry is reported as flaky.
- A screenshot and a video are kept when a test fails.

## Known limitations

- The site is public and shared, so a test may occasionally fail because a page loads slowly. In one series of 21 runs (`--repeat-each=3`) the invalid-login test failed once with a timeout.
- The stock of products is shared: the buy test picks the first product **in stock**, but the stock can run out between the selection and the purchase.
- The final order placement after the payment is confirmed is not checked, because no expected result is specified for it (`TODO-ORACLE`).
- The `with-bugs.practicesoftwaretesting.com` build is a different version (a different registration form, 404 on direct links), so the suite was not run on it (details in `Review.md`).

## AI use

AI assistance for the CI pipeline is documented in [`AI-CI.md`](AI-CI.md).

The code was generated by an AI assistant from my prompts (course policy, Level 1). All prompts, word for word: [`Prompt.md`](Prompt.md). What the AI produced and how I checked and corrected it: [`Review.md`](Review.md). Screenshots of the AI answers and of the test runs: the [`screenshots/`](screenshots/) folder.
