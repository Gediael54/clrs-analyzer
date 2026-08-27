#include <vector>
#include <chrono>
#include <cmath>
#include <string>
#include <algorithm>
#include <emscripten/bind.h>

using namespace emscripten;

struct AlgorithmicMetrics {
    long long comparisons = 0;
    long long assignments = 0;
    double time_microseconds = 0.0;
    long long total_ops = 0;
};

// --- 1. CONSTANT O(1) ---
AlgorithmicMetrics benchmark_constant_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    return AlgorithmicMetrics{0, 1, 0.05, 1};
}

// --- 2. BINARY SEARCH O(log n) ---
AlgorithmicMetrics benchmark_binary_search_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    long long steps = (long long)std::floor(std::log2(n + 1)) + 1;
    long long comp = steps;
    long long assign = steps;
    double t = (double)(comp + assign) * 0.05;
    return AlgorithmicMetrics{comp, assign, t, comp + assign};
}

// --- 3. LINEAR SEARCH O(n) ---
AlgorithmicMetrics benchmark_linear_search_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    long long comp = 2LL * n;
    long long assign = 1LL * n;
    double t = (double)(comp + assign) * 0.02;
    return AlgorithmicMetrics{comp, assign, t, comp + assign};
}

// --- 4. MERGE SORT O(n log n) ---
void merge_clrs(std::vector<int>& A, int p, int q, int r, AlgorithmicMetrics& metrics) {
    int n1 = q - p + 1;
    int n2 = r - q;

    std::vector<int> L(n1);
    std::vector<int> R(n2);

    for (int i = 0; i < n1; i++) {
        L[i] = A[p + i];
        metrics.assignments++;
    }
    for (int j = 0; j < n2; j++) {
        R[j] = A[q + 1 + j];
        metrics.assignments++;
    }

    int i = 0, j = 0, k = p;
    while (i < n1 && j < n2) {
        metrics.comparisons++;
        if (L[i] <= R[j]) {
            A[k] = L[i];
            i++;
        } else {
            A[k] = R[j];
            j++;
        }
        metrics.assignments++;
        k++;
    }

    while (i < n1) {
        A[k] = L[i];
        i++; k++;
        metrics.assignments++;
    }
    while (j < n2) {
        A[k] = R[j];
        j++; k++;
        metrics.assignments++;
    }
}

void merge_sort_recursive(std::vector<int>& A, int p, int r, AlgorithmicMetrics& metrics) {
    if (p < r) {
        int q = p + (r - p) / 2;
        merge_sort_recursive(A, p, q, metrics);
        merge_sort_recursive(A, q + 1, r, metrics);
        merge_clrs(A, p, q, r, metrics);
    }
}

AlgorithmicMetrics benchmark_merge_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    if (n == 1) return AlgorithmicMetrics{0, 1, 0.01, 1};

    if (n > 20000) {
        long long n_ll = n;
        long long ceil_log = (long long)std::ceil(std::log2(n_ll));
        long long comp = n_ll * ceil_log - (1LL << ceil_log) + 1;
        long long assign = 2 * n_ll * ceil_log;
        double est_t = (double)(comp + assign) * 0.0025;
        return AlgorithmicMetrics{comp, assign, est_t, comp + assign};
    }

    AlgorithmicMetrics metrics;
    std::vector<int> A(n);
    for (int i = 0; i < n; i++) A[i] = n - i;

    auto start = std::chrono::high_resolution_clock::now();
    merge_sort_recursive(A, 0, n - 1, metrics);
    auto end = std::chrono::high_resolution_clock::now();

    metrics.time_microseconds = std::chrono::duration<double, std::micro>(end - start).count();
    metrics.total_ops = metrics.comparisons + metrics.assignments;
    return metrics;
}

// --- 5. QUICK SORT O(n log n) ---
AlgorithmicMetrics benchmark_quick_sort_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    if (n == 1) return AlgorithmicMetrics{0, 1, 0.01, 1};
    double log2n = std::log2((double)n + 1.0);
    long long comp = (long long)std::round(1.386 * (double)n * log2n);
    long long assign = (long long)std::round(0.95 * (double)n * log2n);
    double t = (double)(comp + assign) * 0.002;
    return AlgorithmicMetrics{comp, assign, t, comp + assign};
}

// --- 6. INSERTION SORT O(n^2) ---
AlgorithmicMetrics benchmark_insertion_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    if (n == 1) return AlgorithmicMetrics{0, 1, 0.01, 1};

    if (n > 10000) {
        long long n_ll = n;
        long long comp = (n_ll * (n_ll + 1)) / 2 - 1;
        long long assign = n_ll * (n_ll - 1) + 2 * (n_ll - 1);
        double est_t = (double)(comp + assign) * 0.0015;
        return AlgorithmicMetrics{comp, assign, est_t, comp + assign};
    }

    AlgorithmicMetrics metrics;
    std::vector<int> A(n);
    for (int i = 0; i < n; i++) A[i] = n - i;

    auto start = std::chrono::high_resolution_clock::now();
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
    metrics.total_ops = metrics.comparisons + metrics.assignments;
    return metrics;
}

// --- 7. BUBBLE SORT O(n^2) ---
AlgorithmicMetrics benchmark_bubble_sort_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    if (n == 1) return AlgorithmicMetrics{0, 1, 0.01, 1};
    long long n_ll = n;
    long long pairs = (n_ll * (n_ll - 1)) / 2;
    long long comp = pairs;
    long long assign = pairs * 3;
    double t = (double)(comp + assign) * 0.0018;
    return AlgorithmicMetrics{comp, assign, t, comp + assign};
}

// --- 8. MATRIX MULTIPLICATION O(n^3) ---
AlgorithmicMetrics benchmark_matrix_mult_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    if (n == 1) return AlgorithmicMetrics{0, 1, 0.01, 1};
    long long n_ll = n;
    long long n3 = n_ll * n_ll * n_ll;
    long long comp = n_ll * n_ll;
    long long assign = 2 * n3;
    long long total = 4 * n3;
    double t = (double)total * 0.0005;
    return AlgorithmicMetrics{comp, assign, t, total};
}

// --- 9. EXPONENTIAL O(2^n) ---
AlgorithmicMetrics benchmark_exponential_n(int n) {
    if (n <= 0) return AlgorithmicMetrics{0, 0, 0.0, 0};
    long long total = n < 50 ? (1LL << std::min(n, 50)) - 1 : (1LL << 50);
    long long comp = total / 2;
    long long assign = total / 2;
    double t = (double)total * 0.001;
    return AlgorithmicMetrics{comp, assign, t, total};
}

// --- C++ CONTINUOUS EVALUATION FUNCTION (Sem dead-zones de 0 a 1) ---
double evaluate_continuous_ops_cpp(std::string algo_id, double n) {
    if (n <= 0.0) return 0.0;

    if (algo_id == "constant") {
        return std::min(1.0, n);
    } else if (algo_id == "binary_search") {
        return 2.0 * std::log2(n + 1.0);
    } else if (algo_id == "linear_search") {
        return 3.0 * n;
    } else if (algo_id == "merge_sort") {
        return 3.0 * n * std::log2(n + 1.0);
    } else if (algo_id == "quick_sort") {
        return 2.34 * n * std::log2(n + 1.0);
    } else if (algo_id == "insertion_sort") {
        // Crescimento quadrático suave desde a origem: 1.5 n^2 + n
        return 1.5 * n * n + 1.0 * n;
    } else if (algo_id == "bubble_sort") {
        return 2.0 * n * n * (n / (n + 1.0));
    } else if (algo_id == "matrix_mult") {
        return 4.0 * std::pow(n, 3);
    } else if (algo_id == "exponential") {
        if (n > 50.0) return std::pow(2.0, 50) * std::pow(1.05, n - 50.0);
        return std::pow(2.0, n) - 1.0;
    }
    return 0.0;
}

EMSCRIPTEN_BINDINGS(clrs_module) {
    register_vector<int>("VectorInt");

    value_object<AlgorithmicMetrics>("AlgorithmicMetrics")
        .field("comparisons", &AlgorithmicMetrics::comparisons)
        .field("assignments", &AlgorithmicMetrics::assignments)
        .field("time_microseconds", &AlgorithmicMetrics::time_microseconds)
        .field("total_ops", &AlgorithmicMetrics::total_ops);

    function("benchmarkConstant", &benchmark_constant_n);
    function("benchmarkBinarySearch", &benchmark_binary_search_n);
    function("benchmarkLinearSearch", &benchmark_linear_search_n);
    function("benchmarkMerge", &benchmark_merge_n);
    function("benchmarkQuickSort", &benchmark_quick_sort_n);
    function("benchmarkInsertion", &benchmark_insertion_n);
    function("benchmarkBubbleSort", &benchmark_bubble_sort_n);
    function("benchmarkMatrixMult", &benchmark_matrix_mult_n);
    function("benchmarkExponential", &benchmark_exponential_n);
    function("evaluateContinuousOpsCpp", &evaluate_continuous_ops_cpp);
}