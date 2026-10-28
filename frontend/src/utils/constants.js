export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', monacoLang: 'python', extension: '.py', icon: '🐍' },
  { id: 'c', name: 'C', monacoLang: 'c', extension: '.c', icon: '⚙️' },
  { id: 'cpp', name: 'C++', monacoLang: 'cpp', extension: '.cpp', icon: '⚡' },
  { id: 'javascript', name: 'JavaScript', monacoLang: 'javascript', extension: '.js', icon: '🟨' },
];

export const TOPICS = [
  'Variables and data types',
  'Operators',
  'Conditional statements',
  'Loops',
  'Arrays',
  'Strings',
  'Functions',
  'Recursion',
  'Searching and sorting',
  'Object-oriented programming',
  'Basic data structures',
  'Problem-solving and algorithms'
];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const STARTER_CODE = {
  python: `# Python 3 Starter Example
def reverse_words(sentence: str) -> str:
    """Reverse individual words in a string while maintaining sentence order."""
    words = sentence.split(" ")
    reversed_words = [word[::-1] for word in words]
    return " ".join(reversed_words)

# Example usage
msg = "Hello CodeBuddy"
print(reverse_words(msg))
`,
  c: `// C Starter Example
#include <stdio.h>
#include <string.h>

void print_greeting(const char* name) {
    printf("Welcome to CodeBuddy AI, %s!\\n", name);
}

int main() {
    print_greeting("Computer Science Student");
    return 0;
}
`,
  cpp: `// C++ Starter Example
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 25, 30, 45, 50};
    
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    
    std::cout << "Sum of elements: " << sum << std::endl;
    return 0;
}
`,
  javascript: `// JavaScript Starter Example
function calculateFactorial(n) {
    if (n < 0) return null;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

console.log("Factorial of 5 is:", calculateFactorial(5));
`
};
