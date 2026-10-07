## 1. Test plan

### Scope in
- verification the amount: 100 to 500.000 KZT per transfer, whole tenge only;
- verification the daily limit: 1.000.000 KZT across all transfers, reset at midnight Almaty time;
- transfers above 100.000 KZT require a 6-digit SMS code;
- the code is valid for 120 seconds. Three wrong attempts cancel the transfer;
- condition if the amount and the daily limit are both violated, the amount error is shown.
---
### Scope out
- currency conversion (KZT-USD);
- SMS provider infrastructure;
- user autenfication via biometrics;
- refund mechanism.
---
### Approach
#### Levels
- component integration testing for the amount/limit validation logic;
- system testing for the full transfer-with-SMS flow;
- system integration testing for the SMS delivery dependency.

#### Types
- functional (amount, limit, SMS flow correctness);
- non-functional (security — code reuse, code expiry enforcement).

#### Techniques
equivalence partitioning and boundary value analysis, decision table testing, state transition testing

#### Automation
- manual exploratory testing for SMS delivery timing edge cases;
- regression suite for amount/limit boundaries and SMS state transitions, since these are stable and re-run every release.
---
### Entry criteria
- build deploed to the test environment TE-1 (iOS 18.2, app 4.11.0 build 2291);
- smoke test passed: login, open Transfers, account balance visible;
- test data loaded: Test customer TC-014, balance 1.000.000, daily total 0;
- acceptance criteria for REQ-3.1 - REQ-3.4 written and agreed.
---
### Requirement
|           |                       |  
|-----------|-----------------------|
|REQ-3.1    | Amount 100 – 500.000  |
|REQ-3.2    | Daily limit 1.000.000 |
|REQ-3.3    | SMS code above 100.000|
|REQ-3.4    | Insufficient balance  |
|REQ-3.5    | Whole tenge only      |

---
### Exit criteria
- all planned test cases executed;
- no open critical or high defects;
- agreed requirement coverage reached;
- SMS code state-transition regression suite green;
- residual risks written down.
---
### Top three product risks
- Duplicate code entry or network retry – transfer may execute twice. Double-debit defect;
- SMS arrives late, code is already stale. Transfer might execute silently on an expired code;
- Timer fires right after confirmation. May cancel or reverse a transfer that already went through.


## 2. 12 Test cases

### Amount. REQ-3.1
 
| Field | |
|---|---|
| Id | A-1 |
| Traces to | REQ-3.1 Amount 100–500.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 0 |
| Inputs | Transfer 99 KZT to own deposit |
| Expected result | Rejected: "Amount must be at least 100 KZT" |
| Postconditions | No transfer created; balance unchanged |
 
| Field |  |
|---|---|
| Id | A-2 |
| Traces to | REQ-3.1 Amount 100–500.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 0 |
| Inputs | Transfer 100.001 KZT to own deposit |
| Expected result | Notification: "A 6-digit SMS code has been sent to you" |
| Postconditions | SMS entered; balance unchanged |
 
| Field | |
|---|---|
| Id | A-3 |
| Traces to | REQ-3.1 Amount 100–500,000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000, daily total 0 |
| Inputs | Transfer 500.001 KZT to own deposit |
| Expected result | Rejected: "Amount must not exceed 500.000 KZT" |
| Postconditions | No transfer created; balance unchanged |
 
| Field | |
|---|---|
| Id | A-4 |
| Traces to | REQ-3.1 Amount 100–500.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 0 |
| Inputs | Transfer 100.000 KZT to own deposit |
| Expected result | Executed immediately, no SMS code requested |
| Postconditions | Transfer completed; balance decreased by 100.000 KZT |
 
| Field | |
|---|---|
| Id | A-5 |
| Traces to | REQ-3.1 Amount 100–500.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 0 |
| Inputs | Transfer 500.000 KZT to own deposit |
| Expected result | Notification: "A 6-digit SMS code has been sent to you" |
| Postconditions | SMS entered; balance unchanged |
 
| Field | |
|---|---|
| Id | A-6 |
| Traces to | REQ-3.1 Amount 100–500.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 0 |
| Inputs | Transfer 100 KZT to own deposit |
| Expected result | Executed immediately, no SMS code requested |
| Postconditions | Transfer completed; balance decreased by 100 KZT |

### Daily limit. REQ-3.2
 
| Field | |
|---|---|
| Id | D-1 |
| Traces to | REQ-3.2 Daily limit 1.000.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 500.000 (from a prior confirmed transfer) |
| Inputs | Transfer 500,000 KZT to own deposit |
| Expected result | Executed; daily total reaches exactly 1.000.000 KZT |
| Postconditions | Transfer completed; balance decreased by 500.000 KZT |
 
| Field | |
|---|---|
| Id | D-2 |
| Traces to | REQ-3.2 Daily limit 1.000.000 KZT |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 900.000 |
| Inputs | Transfer 100.001 KZT to own deposit |
| Expected result | Rejected: "Daily limit exceeded" |
| Postconditions | No transfer created; balance unchanged |
 
| Field | |
|---|---|
| Id | D-3 |
| Traces to | REQ-3.1 + REQ-3.2 (priority rule) |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, daily total 900.000 |
| Inputs | Transfer 500.001 KZT to own deposit |
| Expected result | Rejected: "Amount must not exceed 500.000 KZT" |
| Postconditions | No transfer created; balance unchanged |

### SMS code. REQ-3.3
 
| Field | |
|---|---|
| Id | S-1 |
| Traces to | REQ-3.3 SMS code above 100.000 |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, transfer of 100.001 KZT initiated, SMS code sent |
| Inputs | Enter the correct SMS code on the first attempt |
| Expected result | Transfer completed |
| Postconditions | Balance decreased by 100.001 KZT |
 
| Field | |
|---|---|
| Id | S-2 |
| Traces to | REQ-3.3 SMS code above 100.000 |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, transfer of 100.001 KZT initiated, SMS code sent |
| Inputs | Enter an incorrect code three times in a row |
| Expected result | Transfer cancelled after the third wrong attempt |
| Postconditions | No transfer created; balance unchanged |
 
| Field ||
|---|---|
| Id | S-3 |
| Traces to | REQ-3.3 SMS code above 100.000 |
| Preconditions | Test customer TC-014, balance 1.000.000 KZT, transfer of 100.001 KZT initiated, SMS code sent |
| Inputs | Wait 120 seconds, then enter the correct code |
| Expected result | Rejected: code expired |
| Postconditions | No transfer created; balance unchanged |

## 3. Traceability matrix

| Reqirement | Test cases | Technique | Status |
|---|---|---|---|
|REQ-3.1 Amount 100–500.000 | A1 - A6 | Equivalence partitioning + boundary value analysis |	6 of 6 not yet executed |
|REQ-3.2 Daily limit 1.000.000 | D1, D2 |	Decision table testing | 2 of 2 not yet executed |
|REQ-3.1 + REQ-3.2 (priority rule) | D3 | Decision table testing | 1 of 1 not yet executed |
|REQ-3.3 SMS code above 100.000 | S1, S2, S3 | State transition testing | 3 of 3 not yet executed |
|REQ-3.4 Insufficient balance |	— | — | NOT COVERED |
|REQ-3.5 Whole tenge only | — | — | NOT COVERED |

**REQ-3.4** Reason: the brief mentions the requirement but does not describe the behavior (error message, priority in the event of simultaneous balance and limit violations).

**REQ 3.5** Brief states "whole tenge only" but does not specify the behavior for a fractional amount: is it rejected outright, rounded up/down, or truncated (fractional part silently dropped)? No test case can be written until this is clarified, because the expected result is unknown.

## 4. Release checklist for the SMS code 

### SMS CODE — RELEASE CHECKLIST
1. [  ]  Code arrives within 30 seconds
2. [  ]  Code expires after 120 seconds
3. [  ]  Third wrong code cancels the transfer
4. [  ]  Code entered after expiry is rejected
5. [  ]  Confirm tapped twice debits once
6. [  ]  Daily total updates after confirmation
7. [  ]  Balance stays unchanged while the SMS code screen is open and waiting for input
8. [  ]  A successfully used code cannot authorize a second transfer (one-time use)
9. [  ]  SMS code request is only triggered for transfers above 100,000 KZT
10. [  ]  Daily total updates only after the transfer is confirmed, not while the code is pending
11. [  ]  When both the amount and the daily limit are violated, the amount error is shown
12. [  ]  SMS text correct in KZ, RU and EN

## 5. Three defect reports
### DEF-001
| Field             | Value |
|-------------------|---|
|Title              |Transfers: balance debited twice after double-tapping Confirm on the SMS code screen |
|Environment        |TE-1, iOS 18.2, app 4.11.0 build 2291 |
|Preconditions      |Test customer TC-014, balance 1.000.000 KZT, daily total 0, transfer of 100.001 KZT initiated, correct SMS code entered |
|Steps to reproduce | 1. Open Transfers - Between my accounts|
|                   | 2. Enter 100.001 and tap continue|
|                   | 3. Enter the correct code|
|                   | 4. Tap confirm twice in quick seccession (1sec)|
|Expected result    |Balance decreases by 100.001 KZT once; one transfer record created |
|Actual result      |Balance decreases by 200.002 KZT; two separate transfer records created |
|Reproducibility    |4 of 5 attempts |
|Severity/priority  |Severity high · priority highest |
|Evidence           |Screen recording of the double tap, both transaction IDs, server request log showing two requests |
|Traces to          |REQ-3.3 / S-1 |

### DEF-002
| Field             | Value |
|-------------------|---|
|Title              |SMS code screen: expired code accepted and transfer completed after the 120-second window |
|Environment        |TE-1, iOS 18.2, app 4.11.0 build 2291 |
|Preconditions      |Test customer TC-014, balance 1.000.000 KZT, daily total 0, transfer of 100.001 KZT initiated, SMS code sent |
|Steps to reproduce | 1. Open Transfers - Between my accounts|
|                   | 2. Enter 100.001 and tap continue|
|                   | 3. Wait 120 seconds without entering the code|
|                   | 4. Enter the originally sent code|
|                   | 5. Tap confirm|
|Expected result    |Code rejected as expired; transfer not completed; balance unchanged |
|Actual result      |Transfer completes; balance decreases by 100.001 KZT |
|Reproducibility    |5 of 5 attempts |
|Severity/priority  |Severity high · priority highest |
|Evidence           |Screen recording; server timestamp of code issuance vs. confirmation |
|Traces to          |REQ-3.3 / S-3 |

### DEF-003
| Field             | Value |
|-------------------|---|
|Title              |Transfers: no defined error behavior when balance is insufficient for the requested amount |
|Environment        |TE-1, iOS 18.2, app 4.11.0 build 2291 |
|Preconditions      |Test customer TC-014, balance 50,000 KZT, daily total 0 |
|Steps to reproduce | 1. Open Transfers - Between my accounts|
|                   | 2. Enter 100.000 and tap continue|
|                   | 3. Tap continue|
|Expected result    |MISSING (no defined the error message) |
|Actual result      |Not applicable. This defect is raised against the requirement|
|Reproducibility    |Not applicable |
|Severity/priority  |Severity medium · priority high |
|Evidence           |Brief / requirements document excerpt showing the gap; confirmation from the business analyst once clarified |
|Traces to          |REQ-3.4 |


## 6. AI appendix

The draft was written manually across all sections of task.

I used:
```
Here are my raw notes from a test session: [paste].

Turn them into a defect report with exactly these fields: title, environment,
preconditions, steps to reproduce, expected result, actual result,
reproducibility, severity, priority, evidence needed.

Rules:
- Use only facts present in my notes. If a field is not in the notes, write  MISSING and do not guess.
- Steps: numbered, one action each, starting from a known state.
- Title format: [screen]: [what happens] [under what condition].
- Propose severity and priority, and mark them as proposals.
```
Raw notes used:
```
TC-014, balance 1000000, daily total 0, transfer 100001 to deposit, entered correct code, tapped confirm twice in a row
(less than 1 second apart). balance down 200002 instead of
100001, two transfers in history. repeated 5 times, reproduced
4 times. env test env 2, iOS 18.2, build 2291

```
---

What the model did:

Correctly wrote MISSING for every field not present in the notes, instead of guessing: screen name, device model, test account ID, logged-in state, confirmation code type, navigation path.
Marked Severity and Priority as "(proposal)," per the rule.
Flagged an ambiguity in the notes instead of picking an interpretation itself: "balance down 200002" could mean the balance decreased by 200.002, or the final balance became −200.002.

---
### Defect report (TC-014)

Title: [Screen name MISSING]: Transfer to deposit is executed twice (−200,002 instead of −100,001) when Confirm is tapped twice within 1 second

#### Environment

Environment: test env 2
OS: iOS 18.2
Build: 2291
Device model: MISSING
Test account / user ID: MISSING

#### Preconditions

Account balance: 1,000,000
Daily transfer total: 0
Logged-in state / starting screen: MISSING
Source account: MISSING
Deposit account (destination) available: implied by notes, details MISSING

#### Steps to reproduce

Navigate to the transfer screen. (Navigation path: MISSING)
Select the deposit as the destination.
Enter amount 100,001.
Enter the correct confirmation code. (Code type, e.g. OTP or PIN: MISSING)
Tap Confirm.
Tap Confirm again less than 1 second after step 5.
Check the account balance.
Check the transaction history.

#### Expected result

The balance decreases by 100,001.
One transfer appears in the history.

#### Actual result

The balance decreases by 200,002 (2 × 100,001).
Two transfers appear in the history.

Reproducibility: 4 of 5 attempts (80%)

Severity (proposal): Critical. The user loses money through a duplicate debit, and the request is not idempotent.

Priority (proposal): High / P1. This is a financial-integrity issue on a core payment flow, and it is easy to trigger by accident with a double tap.

Evidence needed (none is mentioned in the notes)

A screen recording of the double tap
Screenshots of the balance before and after, and of the transaction history showing both entries
Transaction IDs and timestamps for both transfers
Backend or API logs for both requests, showing whether they share an idempotency key or request ID
Details of the one attempt that did not reproduce (timing between taps)