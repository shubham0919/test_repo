CXX = g++
CXXFLAGS = -O3 -std=c++17 -Wall

TARGET = inference_engine

all: $(TARGET)

$(TARGET): inference.cpp
	$(CXX) $(CXXFLAGS) -o $(TARGET) inference.cpp

clean:
	rm -f $(TARGET)
