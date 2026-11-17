---
title: A Light(panda) in the darkness
date: 2026-11-16
excerpt: Ray's journey with Lightpanda as an e2e browser.
tags:
  - tech
---

A couple of months ago I began experimenting with [Lightpanda browser](https://lightpanda.io/) as a replacement for Google Chrome in my Playwright end-to-end testing. Let's walk through the journey, how it started and where it led to.

# Initial implementation

[Here's the implementation PR](https://github.com/The-Adult-In-The-Room/poe2-tools/pull/85). 

## Workarounds
There was a short list of workarounds implemented to complete the migration:
- element.click() in clearForm and openHistory ([DpsCalcPage.ts:54-63](https://github.com/The-Adult-In-The-Room/poe2-tools/pull/85/changes#diff-4a40f2ef3a9a906a09959ddcd2e7d81cdde8adbb5dff5121db336642b6f43b49R54))
- `not_implemented` filter in lightpanda.ts ([lightpanda.ts:10-24](https://github.com/The-Adult-In-The-Room/poe2-tools/pull/85/changes#diff-dd22e7b43dc8075ecb5329a3f1e2d4a9162e7ebdd722b0ab339207d549615b6cR10))
- toBeAttached() instead of toBeVisible() for the history button and panel ([home.spec.ts:220-233](https://github.com/The-Adult-In-The-Room/poe2-tools/pull/85/changes#diff-363555d12e65e2c3d9d2cd93c1bf9c0cdc4c3f475cf577eecfa7591adbcf927fR220))

## Outcomes
Given a sample size of 3 runs with each browser, the average outcome in a CI/CD pipeline running 17 Playwright acceptance tests:

| Name        | Install | Test Run |
| ----------  | ------- | -------- |
| Chrome      | 10s     | 9s       |
| Lightpanda  | 3s      | 7s       |

Disclaimer: I did the averaging and math based on available workflow runs at the time of implementation 2 months ago. I kind of just jotted the figures down rounded to nearest second (I do remember they were very close anyways). I never had intention of writing this blog post back then. Now I regret not capturing proof or more accurate decimals. Oh well, I guess take it with a grain of salt and your mileage may vary.

Based off the limited sample data, we can derive the following about Lightpanda over Chrome:

- 70% faster install
- ~22% faster test run
- ~47% less wall-clock time

I'm curious to see if a larger test suite would yield larger improvements. I am looking forward to the opportunity to compare.

# Post implementation

I began switching all of my core repos to Lightpanda for e2e testing. I never bothered with benchmarking beyond the initial repo, as I felt satisfied with the results. To be honest I probably just mentally moved on to other things, I think it's difficult to stay stuck on caring about a browser used for e2e testing.

## Standardization

One cool thing I did end up doing after that first-repo's implementation was create a reusable [ci-workflows repo](https://github.com/The-Adult-In-The-Room/ci-workflows). Originally I was managing the same copy-paste workflows across 3 projects in lockstep (Read: dumbly making the same changes 3x in rapid succession for far too long).

The ci-workflows repo started off humble with some simple workflows for setting up PR checks (verify). Since then it's matured into workflows supporting all stages of the pipeline, including standardized Railway deployments with smoke tests + rollback. I'll save nerding out about CI/CD automations for another post, for now I feel pretty satisfied with the outcome. The point is now all my repos are running lightpanda from a single source of truth reusable workflow.

# When Lightpanda comes knocking
On a (probably) cold late-October morning I received an email from the COO & Cofounder of Lightpanda asking for feedback on my experience with it. I gave her a link to my implementation PR, with some comments on the workarounds and areas I wasn't sure I did the intended way (like the CDP connection setup).

A few days later a Developer Relations Engineer reached out to me. She had gone through my PR line by line, and gave me updates on the workarounds I had in place. She even provided links to the Lightpanda PRs which resolved the issue, and what version the fixes were included in. Most of the issues I encountered months prior had already been fixed in newer versions of Lightpanda.

After another few days I found the time to audit the implementation. Just as Dev-Rel Engineer explained, I was able to [revert the workarounds](github.com/The-Adult-In-The-Room/poe2-tools/pull/135) to my original Playwright code.

## Where are we now?
I sent the workaround revert PR over to the Dev Rel Engineer to let her know the updated lightpanda version indeed did fix my issues. We discussed an upcoming version of lightpanda which would include CDPServer setup with launch + close methods. This will effectively eliminate [this entire file](https://github.com/The-Adult-In-The-Room/poe2-tools/blob/main/e2e/fixtures/lightpanda.ts) I have copied in each of my repos.

She also asked to feature my project on their [community project list](https://github.com/lightpanda-io/awesome-lightpanda#ai-agents-and-automation), which I've humbly accepted. I'm the ~10th listing down the linked section as of time of this writing.

## Takeaways
I don't think I wrote this post just to share a tool that I found cool or had good results from. I have many of those which I never think to write about. What stood out to me in this case was the personal touch, the intimate care given by the Lightpanda team. I've never experienced Dev Rel outreach for _something I didn't buy_. Beyond that, it was more than some links to implementation documentation. The Dev Rel Engineer personally went through my PR diff and checked on each and every change I made to see if they were still gaps in Lightpanda or had been fixed. I can't even get that level of engineering care from the people I work with 99% of the time, and it's their job.

So that's my experience with Lightpanda. Not just the tool, but the humans behind it. 10/10 will highly recommend going forward. Might even go out of my way a bit to hype them up.

To any readers: Have you ever had an experience similar to this? I'd love to hear about it, please reach out to me. Teams of people such as Lightpanda deserve to be praised for their efforts.
