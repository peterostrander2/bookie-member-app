/**
 * EDUCATION PAGE
 *
 * Educational content library for betting strategies
 * - CLV (Closing Line Value)
 * - Kelly Criterion
 * - Bankroll Management
 * - Sharp vs Public money
 */

import React, { useState } from 'react';

const Education = () => {
  const [activeArticle, setActiveArticle] = useState(null);
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'fundamentals', label: 'Fundamentals', icon: '🎯' },
    { id: 'strategies', label: 'Strategies', icon: '🧠' },
    { id: 'bankroll', label: 'Bankroll', icon: '💰' },
    { id: 'advanced', label: 'Advanced', icon: '🔬' }
  ];

  const articles = [
    {
      id: 'clv',
      title: 'Understanding Closing Line Value (CLV)',
      category: 'fundamentals',
      readTime: '5 min',
      icon: '📈',
      preview: 'Learn why beating the closing line is the #1 indicator of long-term betting success.',
      content: `
## What is Closing Line Value?

Closing Line Value (CLV) is the difference between the odds you bet at and the closing odds (the final line before the game starts). It's widely considered the single best predictor of long-term betting success.

### Why CLV Matters

The market is efficient. By game time, the line reflects all available information. If you consistently beat the closing line, you're demonstrating skill in identifying value before the market corrects.

**Example:**
- You bet Lakers -3.5 at -110
- The line closes at Lakers -5 at -110
- You got 1.5 points of CLV (positive CLV)

### The Math

Studies show that bettors who achieve +2% CLV over time will be profitable regardless of win rate variance. The law of large numbers works in your favor.

### How to Improve Your CLV

1. **Bet Early** - Lines are softest shortly after release
2. **Identify Sharp Moves** - Follow reverse line movement
3. **Find Soft Books** - Some books are slower to adjust
4. **React to News** - Be first to act on injury reports

### Our System

Our AI tracks your CLV on every bet. Check your CLV Dashboard to see how you're performing against the closing line.
      `
    },
    {
      id: 'kelly',
      title: 'The Kelly Criterion Explained',
      category: 'bankroll',
      readTime: '7 min',
      icon: '🎲',
      preview: 'Mathematically optimal bet sizing to maximize long-term growth.',
      content: `
## What is the Kelly Criterion?

The Kelly Criterion is a formula that determines the optimal bet size to maximize long-term bankroll growth while minimizing risk of ruin.

### The Formula

\`\`\`
Kelly % = (bp - q) / b

Where:
b = decimal odds - 1 (e.g., +200 = 2.0)
p = probability of winning
q = probability of losing (1 - p)
\`\`\`

### Example Calculation

You find a bet at +150 odds that you estimate has a 45% chance of winning:

- b = 1.5 (from +150 odds)
- p = 0.45
- q = 0.55

Kelly % = (1.5 × 0.45 - 0.55) / 1.5 = **8.3%**

### Why Use Fractional Kelly?

Full Kelly is mathematically optimal but extremely volatile. Most professional bettors use:

- **Quarter Kelly (0.25)** - Conservative, smooth growth
- **Half Kelly (0.5)** - Balanced approach
- **Full Kelly (1.0)** - Maximum growth, high variance

### Our Recommendation

We recommend **Quarter Kelly** for most bettors. It provides 75% of the growth rate with significantly less volatility.

### Bankroll Settings

Set your Kelly fraction in Profile → Bankroll Settings to see optimal bet sizes for each pick.
      `
    },
    {
      id: 'sharp-money',
      title: 'Sharp vs Public Money',
      category: 'fundamentals',
      readTime: '4 min',
      icon: '🦈',
      preview: 'How to identify where the smart money is going.',
      content: `
## Sharp vs Public Bettors

**Public bettors** are recreational gamblers who bet based on:
- Team popularity
- Recent performance
- Media narratives
- Gut feelings

**Sharp bettors** are professionals who:
- Use statistical models
- Have access to information
- Bet large amounts
- Move lines with their action

### How to Spot Sharp Action

**1. Ticket vs Money Divergence**
When 70% of tickets are on Team A, but 60% of money is on Team B, sharps are on Team B.

**2. Reverse Line Movement (RLM)**
The line moves AGAINST the public. If 75% of bets are on the Lakers -3, but the line moves to Lakers -2.5, sharps are on the other side.

**3. Steam Moves**
Sudden, sharp line movements across multiple books within seconds. This indicates coordinated sharp action.

### Our Sharp Alerts

Our Sharp Money Alerts page tracks:
- Ticket % vs Money % divergence
- Reverse line movement
- Steam moves
- Historical sharp hit rates

Follow the sharks, not the fish.
      `
    },
    {
      id: 'bankroll-management',
      title: 'Bankroll Management 101',
      category: 'bankroll',
      readTime: '6 min',
      icon: '💵',
      preview: 'Protect your bankroll and survive the variance.',
      content: `
## The Foundation of Profitable Betting

You can have the best picks in the world, but without proper bankroll management, you'll eventually go broke. Variance is brutal.

### Setting Your Bankroll

Your bankroll should be:
- Money you can afford to lose
- Separate from living expenses
- Large enough to withstand variance (50-100 units minimum)

### Unit Sizing

A "unit" is typically 1-2% of your bankroll.

| Confidence | Unit Size |
|------------|-----------|
| Standard | 1 unit |
| Strong | 1.5 units |
| SMASH | 2 units |

### The Math of Variance

Even with a 55% win rate (excellent), you'll experience:
- 10+ game losing streaks
- Months where you lose money
- Painful drawdowns

**Key:** Your bankroll must survive these periods.

### Our Bankroll Tools

1. **Bankroll Tracker** - Monitor your P/L over time
2. **Unit Calculator** - Optimal bet sizing based on Kelly
3. **Drawdown Alerts** - Notifications when you hit drawdown limits

### Golden Rules

1. Never bet more than 5% on a single game
2. Don't chase losses
3. Track every bet
4. Reevaluate your edge regularly
      `
    },
    {
      id: 'line-shopping',
      title: 'The Art of Line Shopping',
      category: 'strategies',
      readTime: '4 min',
      icon: '🔍',
      preview: 'Finding the best odds can add 2-3% to your ROI.',
      content: `
## Why Line Shopping Matters

The difference between -110 and -105 doesn't seem like much, but over time it's massive.

### The Math

At -110, you need to win 52.4% to break even.
At -105, you only need 51.2%.

Over 1,000 bets, that 1.2% difference is huge.

### How to Line Shop

1. **Have multiple accounts** - Sign up for 5-8 sportsbooks
2. **Compare before betting** - Always check all books
3. **Use our Best Odds tool** - We compare odds across all major books
4. **Act fast** - Good lines don't last

### Best Books for Line Shopping

| Book | Strength |
|------|----------|
| Pinnacle | Sharpest lines, high limits |
| Circa | Best odds on totals |
| BetMGM | Good promos, soft lines |
| FanDuel | Competitive MLB/NHL |
| DraftKings | Alternate lines |

### Expected Value Gain

Studies show line shopping adds 2-3% to your ROI annually. On a $50,000 annual handle, that's $1,000-1,500 in extra profit.
      `
    },
    {
      id: 'expected-value',
      title: 'Expected Value (EV) Explained',
      category: 'advanced',
      readTime: '5 min',
      icon: '📊',
      preview: 'The mathematical foundation of profitable betting.',
      content: `
## What is Expected Value?

Expected Value (EV) is the average amount you expect to win or lose per bet if you made the same bet infinite times.

### The Formula

\`\`\`
EV = (Win Probability × Profit) - (Loss Probability × Stake)
\`\`\`

### Example

Bet: Lakers -3 at -110 ($110 to win $100)
Your estimated win probability: 55%

EV = (0.55 × $100) - (0.45 × $110)
EV = $55 - $49.50
EV = **+$5.50 per bet**

This is a +EV (positive expected value) bet.

### Finding +EV Bets

Our AI calculates EV by:
1. Running 8 ML models for probability estimation
2. Comparing to implied odds from the market
3. Calculating edge percentage

### The Long Run

In the short term, anything can happen. But over thousands of bets, EV WILL manifest. This is the law of large numbers.

- 100 bets: Anything goes
- 1,000 bets: Skill starts to show
- 10,000 bets: Results converge to true EV

### Our Edge Display

Every pick shows the estimated edge %. A 5% edge means you're expected to profit 5% of your stake on average.
      `
    },
    {
      id: 'ai-models',
      title: 'How Our AI Models Work',
      category: 'advanced',
      readTime: '8 min',
      icon: '🤖',
      preview: 'Deep dive into the 8 ML models powering our picks.',
      content: `
## Our AI Ensemble

We use 8 different machine learning models, each with unique strengths:

### 1. Ensemble Model
Combines predictions from all other models using weighted averaging. Most stable predictor.

### 2. LSTM (Long Short-Term Memory)
Neural network specialized for time-series data. Captures momentum and trends.

### 3. XGBoost
Gradient boosting algorithm. Excellent at finding non-linear patterns.

### 4. Random Forest
Decision tree ensemble. Robust and handles noisy data well.

### 5. Neural Network
Deep learning model with multiple layers. Finds complex patterns.

### 6. Monte Carlo Simulation
Runs thousands of game simulations. Great for totals and props.

### 7. Bayesian Model
Probabilistic model that updates with new information. Handles uncertainty.

### 8. Regression Model
Linear and logistic regression. Simple but powerful baseline.

### Model Agreement

When multiple models agree, confidence increases:
- 8/8 agree: SMASH tier (highest conviction)
- 6-7/8 agree: Strong tier
- 4-5/8 agree: Lean tier
- <4/8 agree: No play

### Feature Inputs

Each model considers:
- Historical performance (last 10, 20, full season)
- Rest days and travel
- Injuries
- Home/away splits
- Matchup history
- Weather (outdoor sports)
- Line movement
- Sharp/public betting splits
      `
    },
    {
      id: 'esoteric-signals',
      title: 'Understanding Esoteric Signals',
      category: 'advanced',
      readTime: '6 min',
      icon: '✨',
      preview: 'When math meets mysticism: numerology, gematria, and more.',
      content: `
## The Esoteric Edge

Beyond traditional analytics, we incorporate esoteric signals that have shown surprising correlations with outcomes.

### Gematria

The ancient practice of assigning numerical values to letters. Certain number patterns (33, 93, 201, 322, 2178) appear in sports outcomes more than random chance would predict.

### Moon Phases

Studies show slight correlations between moon phases and sports outcomes:
- Full Moon: Higher scoring, more upsets
- New Moon: Lower scoring, favorites cover more

### Tesla 3-6-9

Nikola Tesla's obsession with these numbers. When totals or spreads align with 3-6-9 patterns, we note it.

### JARVIS Triggers

Our JARVIS system detects esoteric patterns:
- Immortal Number (2178)
- Master Numbers (11, 22, 33)
- Sacred Geometry alignments

### How We Use It

Esoteric signals are **secondary** to our ML models. They serve as:
1. Tie-breakers between similar picks
2. Confidence boosters when aligned with analytics
3. Warning signals when they contradict

**Never bet purely on esoteric signals.** They're edge enhancers, not primary indicators.
      `
    }
  ];

  const filteredArticles = articles.filter(
    article => category === 'all' || article.category === category
  );

  if (activeArticle) {
    const article = articles.find(a => a.id === activeArticle);
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={() => setActiveArticle(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a1a2e',
              color: '#9ca3af',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Library
          </button>

          {/* Article Header */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{article.icon}</span>
              <div>
                <span style={{
                  backgroundColor: '#8B5CF620',
                  color: '#8B5CF6',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {article.category}
                </span>
              </div>
            </div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px' }}>
              {article.title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              {article.readTime} read
            </p>
          </div>

          {/* Article Content */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid #333'
          }}>
            <div style={{
              color: '#e5e7eb',
              fontSize: '15px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {article.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} style={{ color: '#fff', fontSize: '22px', margin: '30px 0 15px', fontWeight: 'bold' }}>
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={i} style={{ color: '#00D4FF', fontSize: '18px', margin: '25px 0 12px', fontWeight: 'bold' }}>
                      {line.replace('### ', '')}
                    </h3>
                  );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={i} style={{ color: '#fff', fontWeight: 'bold', margin: '15px 0' }}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '20px', marginBottom: '8px' }}>
                      <span style={{ color: '#00D4FF' }}>•</span>
                      <span>{line.replace('- ', '')}</span>
                    </div>
                  );
                }
                if (line.startsWith('|')) {
                  return (
                    <div key={i} style={{
                      backgroundColor: '#12121f',
                      padding: '8px 12px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      borderRadius: '4px',
                      marginBottom: '2px'
                    }}>
                      {line}
                    </div>
                  );
                }
                if (line.startsWith('```') || line.endsWith('```')) {
                  return null;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                return <p key={i} style={{ margin: '10px 0' }}>{line}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Education Library
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Master the fundamentals of profitable sports betting
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: category === cat.id ? '#8B5CF620' : '#1a1a2e',
                color: category === cat.id ? '#8B5CF6' : '#9ca3af',
                border: `1px solid ${category === cat.id ? '#8B5CF650' : '#333'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: category === cat.id ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article.id)}
              style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #333',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  borderColor: '#8B5CF6',
                  transform: 'translateY(-2px)'
                }
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '32px' }}>{article.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      backgroundColor: '#8B5CF620',
                      color: '#8B5CF6',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {article.category}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>
                      {article.readTime}
                    </span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 8px', fontWeight: 'bold' }}>
                    {article.title}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                    {article.preview}
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #333',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <span style={{
                  color: '#8B5CF6',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  Read article →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div style={{
          marginTop: '40px',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Quick Tips for New Bettors
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {[
              { tip: 'Start with a small bankroll you can afford to lose', color: '#10B981' },
              { tip: 'Never chase losses - stick to your unit size', color: '#F59E0B' },
              { tip: 'Track every bet - what gets measured gets improved', color: '#00D4FF' },
              { tip: 'Focus on CLV, not short-term wins', color: '#8B5CF6' }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: '#12121f',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: `3px solid ${item.color}`
              }}>
                <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>
                  {item.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
