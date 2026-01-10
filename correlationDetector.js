/**
 * CORRELATION DETECTOR
 *
 * Identifies when multiple picks are correlated, which increases
 * portfolio risk without diversification benefit.
 *
 * Correlation types:
 * - Same game (obviously correlated)
 * - Same team (if team wins/loses, multiple bets affected)
 * - Same direction (all favorites or all overs)
 * - Same division/conference (schedule/travel patterns)
 * - Market correlation (if sharp money is all one direction)
 */

/**
 * Analyze correlation between picks
 *
 * @param {Array} picks - Array of tracked picks
 * @returns {Object} Correlation analysis with warnings
 */
export const analyzeCorrelation = (picks) => {
  if (!picks || picks.length < 2) {
    return {
      hasCorrelation: false,
      correlationScore: 0,
      warnings: [],
      groups: [],
      diversificationScore: 100
    };
  }

  const warnings = [];
  const groups = [];
  let correlationPoints = 0;

  // 1. Check for same-game correlation
  const sameGameGroups = findSameGamePicks(picks);
  if (sameGameGroups.length > 0) {
    correlationPoints += 30 * sameGameGroups.length;
    sameGameGroups.forEach(group => {
      warnings.push({
        type: 'same_game',
        severity: 'high',
        message: `Multiple bets on ${group.game}: ${group.picks.map(p => p.side).join(', ')}`,
        picks: group.picks
      });
      groups.push(group);
    });
  }

  // 2. Check for same-team correlation
  const sameTeamGroups = findSameTeamPicks(picks);
  if (sameTeamGroups.length > 0) {
    correlationPoints += 20 * sameTeamGroups.length;
    sameTeamGroups.forEach(group => {
      warnings.push({
        type: 'same_team',
        severity: 'medium',
        message: `Multiple bets involving ${group.team}`,
        picks: group.picks
      });
      groups.push(group);
    });
  }

  // 3. Check for directional bias
  const directionalBias = analyzeDirectionalBias(picks);
  if (directionalBias.hasBias) {
    correlationPoints += directionalBias.severity === 'high' ? 25 : 15;
    warnings.push({
      type: 'directional',
      severity: directionalBias.severity,
      message: directionalBias.message,
      picks: directionalBias.picks
    });
  }

  // 4. Check for spread clustering
  const spreadCluster = analyzeSpreadClustering(picks);
  if (spreadCluster.hasClustering) {
    correlationPoints += 15;
    warnings.push({
      type: 'spread_cluster',
      severity: 'low',
      message: spreadCluster.message,
      picks: spreadCluster.picks
    });
  }

  // 5. Check for total clustering
  const totalCluster = analyzeTotalClustering(picks);
  if (totalCluster.hasClustering) {
    correlationPoints += 15;
    warnings.push({
      type: 'total_cluster',
      severity: 'low',
      message: totalCluster.message,
      picks: totalCluster.picks
    });
  }

  // Calculate diversification score (100 = perfectly diversified, 0 = highly correlated)
  const diversificationScore = Math.max(0, 100 - correlationPoints);

  return {
    hasCorrelation: warnings.length > 0,
    correlationScore: Math.min(100, correlationPoints),
    warnings,
    groups,
    diversificationScore,
    recommendation: getCorrelationRecommendation(diversificationScore, warnings)
  };
};

/**
 * Find picks on the same game
 */
const findSameGamePicks = (picks) => {
  const gameMap = {};

  picks.forEach(pick => {
    const gameKey = `${pick.game?.home_team || pick.home_team}-${pick.game?.away_team || pick.away_team}`;
    if (!gameMap[gameKey]) {
      gameMap[gameKey] = [];
    }
    gameMap[gameKey].push(pick);
  });

  return Object.entries(gameMap)
    .filter(([_, groupPicks]) => groupPicks.length > 1)
    .map(([game, groupPicks]) => ({
      type: 'same_game',
      game,
      picks: groupPicks
    }));
};

/**
 * Find picks involving the same team
 */
const findSameTeamPicks = (picks) => {
  const teamMap = {};

  picks.forEach(pick => {
    const homeTeam = pick.game?.home_team || pick.home_team;
    const awayTeam = pick.game?.away_team || pick.away_team;

    [homeTeam, awayTeam].forEach(team => {
      if (team) {
        if (!teamMap[team]) {
          teamMap[team] = [];
        }
        teamMap[team].push(pick);
      }
    });
  });

  return Object.entries(teamMap)
    .filter(([_, teamPicks]) => teamPicks.length > 1)
    .map(([team, teamPicks]) => ({
      type: 'same_team',
      team,
      picks: teamPicks
    }));
};

/**
 * Analyze directional bias (all favorites, all underdogs, all overs, etc.)
 */
const analyzeDirectionalBias = (picks) => {
  const spreadPicks = picks.filter(p => p.bet_type === 'spread');
  const totalPicks = picks.filter(p => p.bet_type === 'total');

  // Check spread direction
  if (spreadPicks.length >= 3) {
    const favorites = spreadPicks.filter(p => {
      const line = p.line || p.opening_line;
      return (p.side === 'HOME' && line < 0) || (p.side === 'AWAY' && line > 0);
    });
    const underdogs = spreadPicks.length - favorites.length;

    if (favorites.length >= spreadPicks.length * 0.8) {
      return {
        hasBias: true,
        severity: 'high',
        message: `${favorites.length}/${spreadPicks.length} picks are favorites - heavy chalk exposure`,
        picks: favorites
      };
    }
    if (underdogs >= spreadPicks.length * 0.8) {
      return {
        hasBias: true,
        severity: 'medium',
        message: `${underdogs}/${spreadPicks.length} picks are underdogs - high variance exposure`,
        picks: spreadPicks.filter(p => !favorites.includes(p))
      };
    }
  }

  // Check total direction
  if (totalPicks.length >= 3) {
    const overs = totalPicks.filter(p => p.side === 'OVER');
    const unders = totalPicks.length - overs.length;

    if (overs.length >= totalPicks.length * 0.8) {
      return {
        hasBias: true,
        severity: 'medium',
        message: `${overs.length}/${totalPicks.length} totals are OVER - weather/pace correlation risk`,
        picks: overs
      };
    }
    if (unders >= totalPicks.length * 0.8) {
      return {
        hasBias: true,
        severity: 'medium',
        message: `${unders}/${totalPicks.length} totals are UNDER - weather/pace correlation risk`,
        picks: totalPicks.filter(p => p.side !== 'OVER')
      };
    }
  }

  return { hasBias: false };
};

/**
 * Analyze spread clustering (all big favorites or all big underdogs)
 */
const analyzeSpreadClustering = (picks) => {
  const spreadPicks = picks.filter(p => p.bet_type === 'spread');

  if (spreadPicks.length < 3) {
    return { hasClustering: false };
  }

  const bigSpreads = spreadPicks.filter(p => {
    const line = Math.abs(p.line || p.opening_line || 0);
    return line >= 7;
  });

  if (bigSpreads.length >= spreadPicks.length * 0.6) {
    return {
      hasClustering: true,
      message: `${bigSpreads.length}/${spreadPicks.length} spreads are 7+ points - similar volatility`,
      picks: bigSpreads
    };
  }

  return { hasClustering: false };
};

/**
 * Analyze total clustering (all high or all low totals)
 */
const analyzeTotalClustering = (picks) => {
  const totalPicks = picks.filter(p => p.bet_type === 'total');

  if (totalPicks.length < 3) {
    return { hasClustering: false };
  }

  // This would need sport context for proper thresholds
  // For now, just check if they're all in similar range
  const totals = totalPicks.map(p => p.line || p.opening_line || 0);
  const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((sum, t) => sum + Math.pow(t - avgTotal, 2), 0) / totals.length;

  if (variance < 25) { // Low variance = clustered
    return {
      hasClustering: true,
      message: 'Totals are clustered in similar range - pace/weather correlation',
      picks: totalPicks
    };
  }

  return { hasClustering: false };
};

/**
 * Get recommendation based on correlation analysis
 */
const getCorrelationRecommendation = (diversificationScore, warnings) => {
  if (diversificationScore >= 80) {
    return {
      status: 'good',
      color: '#00FF88',
      message: 'Well diversified portfolio',
      action: 'Proceed with normal sizing'
    };
  } else if (diversificationScore >= 60) {
    return {
      status: 'caution',
      color: '#FFD700',
      message: 'Some correlation detected',
      action: 'Consider reducing total exposure by 20%'
    };
  } else if (diversificationScore >= 40) {
    return {
      status: 'warning',
      color: '#FF8844',
      message: 'Significant correlation risk',
      action: 'Reduce exposure by 40% or drop correlated picks'
    };
  } else {
    return {
      status: 'danger',
      color: '#FF4444',
      message: 'High correlation - portfolio at risk',
      action: 'Remove correlated picks or drastically reduce sizing'
    };
  }
};

/**
 * Quick correlation check for a single new pick against existing picks
 */
export const checkPickCorrelation = (newPick, existingPicks) => {
  const issues = [];

  // Check same game
  const sameGame = existingPicks.find(p =>
    (p.game?.home_team === newPick.home_team || p.home_team === newPick.home_team) &&
    (p.game?.away_team === newPick.away_team || p.away_team === newPick.away_team)
  );
  if (sameGame) {
    issues.push({
      severity: 'high',
      message: `Already have a bet on this game (${sameGame.side} ${sameGame.bet_type})`
    });
  }

  // Check same team
  const sameTeam = existingPicks.find(p => {
    const teams = [p.game?.home_team, p.game?.away_team, p.home_team, p.away_team].filter(Boolean);
    return teams.includes(newPick.home_team) || teams.includes(newPick.away_team);
  });
  if (sameTeam && !sameGame) {
    issues.push({
      severity: 'medium',
      message: `Team overlap with existing pick`
    });
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    canProceed: !issues.some(i => i.severity === 'high')
  };
};

/**
 * Calculate optimal position sizing based on correlation
 */
export const getAdjustedSizing = (baseSizing, correlationAnalysis) => {
  const { diversificationScore } = correlationAnalysis;

  // Reduce sizing based on correlation
  let multiplier = 1;
  if (diversificationScore < 40) {
    multiplier = 0.5;
  } else if (diversificationScore < 60) {
    multiplier = 0.7;
  } else if (diversificationScore < 80) {
    multiplier = 0.85;
  }

  return {
    originalSize: baseSizing,
    adjustedSize: Math.round(baseSizing * multiplier * 100) / 100,
    multiplier,
    reason: multiplier < 1
      ? `Reduced ${Math.round((1 - multiplier) * 100)}% due to correlation`
      : 'No adjustment needed'
  };
};

export default {
  analyzeCorrelation,
  checkPickCorrelation,
  getAdjustedSizing
};
