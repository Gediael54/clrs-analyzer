#include <vector>
#include <chrono>
#include <emscripten/bind.h>
using namespace emscripten;

struct AlgorithmicMetrics {
  long long comparisons = 0;
  long long assignments = 0;
  double time_microseconds = 0.0;
};

AlgorithmicMetrics insertion_sort_clrs(std::vector<int> A) {
  AlgorithmicMetrics metrics;
  auto start = std::chrono::high_resolution_clock::now();
  int n = A.size();

  for (int j = 1; j < n; j++) {
    metrics.assignments++;
    int key = A[j];
    int i = j - 1;
    metrics.assignments++;

    while (i >= 0 && A[i] > key) {
      metrics.comparisons++;
      A[i + 1] = A[i];
      metrics.assignments++;
      i = i - 1;
      metrics.assignments++;
    }
    if (i >= 0) metrics.comparisons++;

    A[i + 1] = key;
    metrics.assignments++;
  }

  auto end = std::chrono::high_resolution_clock::now();
  metrics.time_microseconds = std::chrono::duration<double, std::micro>(end - start).count();
  return metrics;
}

EMSCRIPTEN_BINDINGS(clrs_module) {

  register_vector<int>("VectorInt");

  value_object<AlgorithmicMetrics>("AlgorithmicMetrics")
    .field("comparisons", &AlgorithmicMetrics::comparisons)
    .field("assignments", &AlgorithmicMetrics::assignments)
    .field("time_microseconds", &AlgorithmicMetrics::time_microseconds);

  function("insertionSort", &insertion_sort_clrs);
}
