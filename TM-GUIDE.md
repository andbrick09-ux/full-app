# Dom Sub Hub — Training Module (TM) User Guide

The Training Module (TM) engine is a powerful, Spaced Repetition System (SRS) designed to help Submissives master protocols, body positions, rules, and knowledge. It uses advanced memory algorithms to ensure long-term retention.

This guide breaks down how both Dominants and Submissives interact with the TM ecosystem.

---

## 👑 For the Dominant (Dom)

As a Dominant, your primary role in the TM ecosystem is **oversight**. The system handles the training algorithms automatically, freeing you to monitor your Submissive's progress, effort, and mastery.

### 1. The Dom Overview Dashboard (`tm-dom-overview.html`)
This is your command center for tracking your Submissives' training.
- **Roster Selection:** If you have multiple Submissives, use the dropdown at the top to select which Submissive's data you want to view.
- **Mastery Overview:** You will see a breakdown of the Submissive's overall mastery percentage across all published modules.
- **Recent Activity Log:** This feed shows you exactly when your Submissive trained, what topics they studied, how many items they reviewed, and their accuracy. 
- **Accountability:** Use this page to ensure your Submissive is keeping up with their daily reviews. A Submissive who is missing days will see their pending reviews pile up.

### 2. Course Creation & Admin (`tm-admin.html` & `tm-admin-topic.html`)
*(Note: You must have `isAdmin: true` set on your account to access these pages).*
- **Creating Topics:** You can create high-level Topics (e.g., "Protocol Postures", "Rules of the House").
- **Subcategories:** Break topics down into logical groups (e.g., "Standing Postures", "Floor Postures").
- **Flashcards (Training Items):** Create the actual training materials. You can write the Front (Question/Prompt) and the Back (Answer/Explanation). 
- **Publishing:** Modules are completely hidden from Submissives until you toggle them to "Published".

---

## 🔗 For the Submissive (Sub)

As a Submissive, your responsibility is **consistency**. The TM system is designed to test your knowledge and schedule reviews exactly when your brain is about to forget the information.

### 1. The Training Hub (`tm-hub.html`)
This is your starting point for all training.
- **Available Topics:** You will see a list of all Published training modules assigned to you.
- **Progress Tracking:** Each module displays your Mastery percentage. Your goal is to get this as close to 100% as possible.
- **Due for Review:** The system will flag topics that have items waiting for your review today.

### 2. Topic Details (`tm-topic.html`)
When you click into a specific Topic, you'll see its subcategories.
- You can see exactly how many items you've mastered in each subcategory.
- Click **"Start Training Session"** to begin studying.

### 3. The Training Session (`tm-session.html`)
This is where the actual work happens. The session will test you using Flashcards.

**How to Train:**
1. You will be shown the **Front** of a card (e.g., "Describe the Egyptian posture").
2. Think of the answer or physically assume the posture.
3. Click **"Reveal Answer"**.
4. Read the **Back** of the card and honestly evaluate how well you did.

**Self-Grading:**
You must choose one of three grades. Your honesty here dictates how the algorithm schedules this card next!
- 🔴 **Hard:** You got it wrong, or completely blanked. *(The system will make you review this card again very soon).*
- 🟡 **Good:** You got it right, but it took a lot of thought or you hesitated. *(The system will increase the interval slightly).*
- 🟢 **Easy:** You knew it instantly without thinking. *(The system will push this card far into the future so you don't waste time on things you already know).*

### 4. The Algorithm (How it works behind the scenes)
The TM pages use a modified **SuperMemo-2 (SM-2)** algorithm. 
- When you first learn a new item, you will see it frequently (e.g., tomorrow, then in 3 days).
- As you consistently grade an item "Good" or "Easy", the gap between reviews grows exponentially (e.g., 10 days, 30 days, 6 months).
- If you grade a mature item "Hard", its interval resets, and you will have to rebuild your mastery of it.
- **Consistency is key:** If you skip training for a week, your "Due Reviews" will pile up. Train daily for the best results.
