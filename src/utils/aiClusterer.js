export class AIClusterer {
  constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about'
    ]);
  }

  async clusterTabs(tabs) {
    // Extract features from tabs
    const features = tabs.map(tab => this.extractFeatures(tab));
    
    // Perform clustering using domain and content similarity
    const clusters = this.performClustering(features, tabs);
    
    return clusters;
  }

  extractFeatures(tab) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    const path = url.pathname;
    const title = tab.title || '';
    
    // Extract keywords from title
    const keywords = this.extractKeywords(title);
    
    // Categorize by domain patterns
    const category = this.categorizeByDomain(domain);
    
    return {
      domain,
      path,
      title,
      keywords,
      category,
      tab
    };
  }

  extractKeywords(text) {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .slice(0, 10); // Top 10 keywords
  }

  categorizeByDomain(domain) {
    const patterns = {
      'social': ['twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'reddit.com'],
      'video': ['youtube.com', 'vimeo.com', 'twitch.tv', 'netflix.com'],
      'news': ['cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 'theguardian.com'],
      'shopping': ['amazon.com', 'ebay.com', 'etsy.com', 'shopify.com'],
      'dev': ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.'],
      'docs': ['docs.google.com', 'notion.so', 'confluence.', 'wiki.'],
      'work': ['slack.com', 'teams.microsoft.com', 'zoom.us', 'calendar.google.com']
    };
    
    for (const [category, domains] of Object.entries(patterns)) {
      if (domains.some(pattern => domain.includes(pattern))) {
        return category;
      }
    }
    
    return 'general';
  }

  performClustering(features, tabs) {
    const clusters = new Map();
    
    features.forEach((feature, index) => {
      let bestCluster = null;
      let bestScore = 0;
      
      // Find best matching cluster
      for (const [clusterId, cluster] of clusters) {
        const score = this.calculateSimilarity(feature, cluster.representative);
        if (score > bestScore && score > 0.3) { // Threshold for clustering
          bestScore = score;
          bestCluster = clusterId;
        }
      }
      
      if (bestCluster) {
        // Add to existing cluster
        clusters.get(bestCluster).tabs.push(feature.tab);
        clusters.get(bestCluster).features.push(feature);
      } else {
        // Create new cluster
        const clusterId = `cluster_${clusters.size}`;
        clusters.set(clusterId, {
          id: clusterId,
          topic: this.generateTopicName(feature),
          tabs: [feature.tab],
          features: [feature],
          representative: feature,
          confidence: 1.0
        });
      }
    });
    
    // Convert to array and filter small clusters
    return Array.from(clusters.values())
      .filter(cluster => cluster.tabs.length >= 2)
      .map(cluster => ({
        ...cluster,
        topic: this.refineTopicName(cluster),
        confidence: this.calculateClusterConfidence(cluster)
      }));
  }

  calculateSimilarity(feature1, feature2) {
    let score = 0;
    
    // Domain similarity (high weight)
    if (feature1.domain === feature2.domain) {
      score += 0.5;
    }
    
    // Category similarity
    if (feature1.category === feature2.category) {
      score += 0.3;
    }
    
    // Keyword similarity
    const commonKeywords = feature1.keywords.filter(k => 
      feature2.keywords.includes(k)
    );
    score += (commonKeywords.length / Math.max(feature1.keywords.length, feature2.keywords.length)) * 0.2;
    
    return score;
  }

  generateTopicName(feature) {
    if (feature.category !== 'general') {
      return this.capitalizeFirst(feature.category);
    }
    
    // Use most common keyword or domain
    if (feature.keywords.length > 0) {
      return this.capitalizeFirst(feature.keywords[0]);
    }
    
    return this.capitalizeFirst(feature.domain.split('.')[0]);
  }

  refineTopicName(cluster) {
    // Find most common category
    const categories = cluster.features.map(f => f.category);
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    const mostCommonCategory = Object.keys(categoryCount)
      .reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
    
    if (mostCommonCategory !== 'general') {
      return this.capitalizeFirst(mostCommonCategory);
    }
    
    // Find most common keywords
    const allKeywords = cluster.features.flatMap(f => f.keywords);
    const keywordCount = {};
    allKeywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
    
    const topKeyword = Object.keys(keywordCount)
      .reduce((a, b) => keywordCount[a] > keywordCount[b] ? a : b, '');
    
    if (topKeyword) {
      return this.capitalizeFirst(topKeyword);
    }
    
    // Fallback to domain
    const domains = cluster.features.map(f => f.domain);
    const uniqueDomains = [...new Set(domains)];
    if (uniqueDomains.length === 1) {
      return this.capitalizeFirst(uniqueDomains[0].split('.')[0]);
    }
    
    return 'Mixed Collection';
  }

  calculateClusterConfidence(cluster) {
    // Calculate confidence based on similarity within cluster
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < cluster.features.length; i++) {
      for (let j = i + 1; j < cluster.features.length; j++) {
        totalSimilarity += this.calculateSimilarity(
          cluster.features[i], 
          cluster.features[j]
        );
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 1.0;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}