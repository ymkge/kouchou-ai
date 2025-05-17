"use client";

import { SelectChartButton } from "@/components/charts/SelectChartButton";
import { AttributeFilterDialog } from "@/components/report/AttributeFilterDialog";
import { Chart } from "@/components/report/Chart";
import { ClusterOverview } from "@/components/report/ClusterOverview";
import { DisplaySettingDialog } from "@/components/report/DisplaySettingDialog";
import type { Cluster, Result } from "@/type";
import { Box, Button } from "@chakra-ui/react";
import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  result: Result;
};

// 属性フィルタの型定義
type AttributeFilters = Record<string, string[]>;

// コメントオブジェクトの型定義を拡張
type CommentWithAttributes = {
  comment: string;
  [key: string]: string | undefined;
};

export function ClientContainer({ result }: Props) {
  const [filteredResult, setFilteredResult] = useState<Result>(result);
  const [openDensityFilterSetting, setOpenDensityFilterSetting] = useState(false);
  const [selectedChart, setSelectedChart] = useState("scatterAll");
  const [maxDensity, setMaxDensity] = useState(0.2);
  const [minValue, setMinValue] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDenseGroupEnabled, setIsDenseGroupEnabled] = useState(true);
  const [showClusterLabels, setShowClusterLabels] = useState(true);
  const [treemapLevel, setTreemapLevel] = useState("0");
  
  // 属性フィルタの状態を管理
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilters>({});
  const [openAttributeFilter, setOpenAttributeFilter] = useState(false);

  // 利用可能な属性と値のセットを抽出
  const availableAttributes = useMemo(() => {
    const attributes: Record<string, Set<string>> = {};
    
    // 全ての意見から属性を抽出
    result.arguments.forEach((arg) => {
      const argId = arg.arg_id;
      // Safely handle potentially undefined comment_id
      if (arg.comment_id === undefined) return;
      
      const commentId = arg.comment_id.toString();
      const comment = result.comments[commentId] as CommentWithAttributes | undefined;
      
      if (comment) {
        // commentオブジェクトから属性を抽出（commentとid以外のプロパティ）
        Object.entries(comment).forEach(([key, value]) => {
          if (key !== 'comment' && value !== undefined && value !== null) {
            if (!attributes[key]) {
              attributes[key] = new Set<string>();
            }
            attributes[key].add(String(value));
          }
        });
      }
    });
    
    // Set を配列に変換して返す
    const attributesArray: Record<string, string[]> = {};
    Object.entries(attributes).forEach(([key, valueSet]) => {
      attributesArray[key] = Array.from(valueSet).sort();
    });
    
    return attributesArray;
  }, [result]);

  // maxDensityやminValueが変化するたびに密度フィルターの結果をチェック
  useEffect(() => {
    const { filtered, isEmpty } = getDenseClusters(result.clusters || [], maxDensity, minValue);
    setIsDenseGroupEnabled(!isEmpty);
  }, [maxDensity, minValue, result.clusters]);

  // 属性フィルタと密度フィルタを組み合わせて適用する関数
  function updateFilteredResult(maxDensity: number, minValue: number, attrFilters: AttributeFilters = attributeFilters) {
    if (!result) return;

    // 1. 属性フィルタに基づいて引数をフィルタリング
    let filteredArgs = result.arguments;
    
    if (Object.keys(attrFilters).length > 0) {
      filteredArgs = result.arguments.filter((arg) => {
        // Safely handle potentially undefined comment_id
        if (arg.comment_id === undefined) return false;
        
        const commentId = arg.comment_id.toString();
        const comment = result.comments[commentId] as CommentWithAttributes | undefined;
        
        if (!comment) return false;
        
        // すべてのフィルタ条件を満たすか確認
        return Object.entries(attrFilters).every(([attrName, selectedValues]) => {
          const commentValue = comment[attrName];
          return selectedValues.includes(String(commentValue));
        });
      });
    }
    
    // 2. フィルタされた引数を含むクラスタIDを集める
    const clusterIdsWithFilteredArgs = new Set<string>();
    filteredArgs.forEach((arg) => {
      arg.cluster_ids.forEach((clusterId) => {
        clusterIdsWithFilteredArgs.add(clusterId);
      });
    });
    
    // 3. 密度フィルタを適用
    const { filtered: densityFilteredClusters } = getDenseClusters(result.clusters || [], maxDensity, minValue);
    
    // 4. 両方のフィルタを組み合わせる
    const combinedFilteredClusters = densityFilteredClusters.filter((cluster) => 
      Object.keys(attrFilters).length === 0 || clusterIdsWithFilteredArgs.has(cluster.id)
    );
    
    setFilteredResult({
      ...result,
      clusters: combinedFilteredClusters,
      arguments: Object.keys(attrFilters).length === 0 ? result.arguments : filteredArgs,
    });
  }

  function onChangeDensityFilter(maxDensity: number, minValue: number) {
    setMaxDensity(maxDensity);
    setMinValue(minValue);
    if (selectedChart === "scatterDensity" || selectedChart === "scatterAll") {
      updateFilteredResult(maxDensity, minValue);
    }
  }

  function handleApplyAttributeFilters(filters: AttributeFilters) {
    setAttributeFilters(filters);
    updateFilteredResult(maxDensity, minValue, filters);
  }

  // 表示するクラスタを選択
  const clustersToDisplay =
    selectedChart === "scatterDensity"
      ? filteredResult.clusters.filter((c) => c.level === Math.max(...filteredResult.clusters.map((c) => c.level)))
      : result.clusters.filter((c) => c.level === 1);

  const handleCloseDisplaySetting = function() {
    setOpenDensityFilterSetting(false);
  };

  const handleToggleClusterLabels = function(value: boolean) {
    setShowClusterLabels(value);
  };

  const handleCloseAttributeFilter = function() {
    setOpenAttributeFilter(false);
  };

  const handleChartChange = function(selectedChart: string) {
    setSelectedChart(selectedChart);
    if (selectedChart === "scatterAll" || selectedChart === "treemap") {
      updateFilteredResult(1, 0);
    }
    if (selectedChart === "scatterDensity") {
      updateFilteredResult(maxDensity, minValue);
    }
  };

  const handleClickDensitySetting = function() {
    setOpenDensityFilterSetting(true);
  };

  const handleClickFullscreen = function() {
    setIsFullscreen(true);
  };

  const handleOpenAttributeFilter = function() {
    setOpenAttributeFilter(true);
  };

  const handleExitFullscreen = function() {
    setIsFullscreen(false);
  };

  const handleTreeZoom = function(value: string) {
    setTreemapLevel(value);
  };

  return (
    <div>
      {openDensityFilterSetting && 
        <DisplaySettingDialog
          currentMaxDensity={maxDensity}
          currentMinValue={minValue}
          onClose={handleCloseDisplaySetting}
          onChangeFilter={onChangeDensityFilter}
          showClusterLabels={showClusterLabels}
          onToggleClusterLabels={handleToggleClusterLabels}
        />
      }
      
      {openAttributeFilter && 
        <AttributeFilterDialog
          onClose={handleCloseAttributeFilter}
          onApplyFilters={handleApplyAttributeFilters}
          availableAttributes={availableAttributes}
          currentFilters={attributeFilters}
        />
      }
      
      <Box display="flex" gap={2} mb={3}>
        <SelectChartButton
          selected={selectedChart}
          onChange={handleChartChange}
          onClickDensitySetting={handleClickDensitySetting}
          onClickFullscreen={handleClickFullscreen}
          isDenseGroupEnabled={isDenseGroupEnabled}
        />
        
        {Object.keys(availableAttributes).length > 0 && 
          <Button 
            onClick={handleOpenAttributeFilter}
            size="sm"
            variant="outline"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Filter size={16} />
              <span>
                属性フィルタ {Object.keys(attributeFilters).length > 0 ? `(${Object.keys(attributeFilters).length})` : ''}
              </span>
            </Box>
          </Button>
        }
      </Box>
      
      <Chart
        result={filteredResult}
        selectedChart={selectedChart}
        isFullscreen={isFullscreen}
        onExitFullscreen={handleExitFullscreen}
        showClusterLabels={showClusterLabels}
        onToggleClusterLabels={handleToggleClusterLabels}
        treemapLevel={treemapLevel}
        onTreeZoom={handleTreeZoom}
      />

      {clustersToDisplay.map((c) => (
        <ClusterOverview key={c.id} cluster={c} />
      ))}
    </div>
  );
}

function getDenseClusters(
  clusters: Cluster[],
  maxDensity: number,
  minValue: number,
): { filtered: Cluster[]; isEmpty: boolean } {
  // 全意見グループの中で一番大きい level を deepestLevel として取得します。
  const deepestLevel = clusters.reduce((maxLevel, cluster) => Math.max(maxLevel, cluster.level), 0);

  console.log("=== Dense Cluster Extraction ===");
  console.log(`Filter settings: maxDensity=${maxDensity}, minValue=${minValue}`);

  const deepestLevelClusters = clusters.filter((c) => c.level === deepestLevel);
  console.log(`Total clusters at deepest level (${deepestLevel}): ${deepestLevelClusters.length}`);

  for (const cluster of deepestLevelClusters) {
    console.log(
      `Cluster ID: ${cluster.id}, Label: ${cluster.label}, Density: ${cluster.density_rank_percentile}, Elements: ${cluster.value}`,
    );
  }

  const filteredDeepestLevelClusters = deepestLevelClusters
    .filter((c) => c.density_rank_percentile <= maxDensity)
    .filter((c) => c.value >= minValue);

  console.log(`Clusters after filtering: ${filteredDeepestLevelClusters.length}`);
  console.log(filteredDeepestLevelClusters);
  console.log("=== End of Dense Cluster Extraction ===");

  return {
    filtered: [...clusters.filter((c) => c.level !== deepestLevel), ...filteredDeepestLevelClusters],
    isEmpty: filteredDeepestLevelClusters.length === 0,
  };
}
