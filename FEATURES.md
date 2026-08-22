# IronDog — Feature Specification

## Purpose

A mobile app for tracking weightlifting and bodybuilding workouts in the gym.
Built for **hypertrophy** and **progressive overload**.

---

## Core Features

### 1. Workout Session

- Start a new workout for the current day
- Each workout is a collection of exercises with sets, weight, and reps
- Workouts are date-stamped and stored for history

### 2. Exercise Catalog

Exercises are categorized by **muscle group**, then by **machine/exercise name**.

| Muscle Group | Example Exercises |
|---|---|
| Chest | Incline Bench Press, Pec-Deck, Cable Fly, Flat Dumbbell Press |
| Shoulders | Overhead Press, Lateral Raise, Rear Delt Fly, Cable Front Raise |
| Back | Lat Pulldown, Seated Cable Row, Barbell Row, Chest-Supported Row |
| Arms | Incline Dumbbell Curl, Cable Curl, Tricep Pushdown, Overhead Extension |
| Legs | Leg Press, Hack Squat, Romanian Deadlift, Leg Curl, Leg Extension, Calf Raise |

### 3. Set Tracking

Each exercise within a workout tracks one or more sets:

- **Set number** (order)
- **Weight** (lbs/kg)
- **Reps**
- **Failure** — boolean flag indicating the set was taken to failure (RPE 10)

### 4. Weight Recommendation (Key Feature)

Before starting an exercise, the app recommends:

- A **starting weight** for the first set
- A **target weight and reps** for the final set

Based on **last session's performance** for that exercise.

#### Recommendation Logic

1. Find the most recent workout containing this exercise
2. Look at the last set that was **not** taken to failure
3. Recommend starting at that weight (or the set before it if it was a warm-up)
4. Target progression: aim for 1–2 more reps or 2.5–5 lbs more on the final working set

#### Example

> Last session (Cable Curl):
> - Set 1: 40 lbs × 12
> - Set 2: 50 lbs × 12
> - Set 3: 60 lbs × 9 (failure)
>
> **Recommendation:** Start at 50 lbs, target 12 reps at 60 lbs for the last set.

### 5. Workout History

- Browse past workouts by date
- View exercise breakdown for each session
- See trends in weight/reps over time per exercise

---

## Design Principles

- **Gym-use first**: large touch targets, easy one-handed input, minimal taps
- **Fast data entry**: minimize friction between sets
- **Clear recommendations**: weight suggestions should be prominent and actionable
- **No fluff**: no social features, no gamification — just tracking and progression

---

## Out of Scope (for now)

- Cardio or endurance tracking
- Nutrition or bodyweight tracking
- Social/sharing features
- Wearable device integration
