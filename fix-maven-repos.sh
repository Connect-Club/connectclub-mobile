#grep -rl "jcenter()" node_modules/ | xargs sed -i 's/jcenter()/mavenCentral()/'
#sed -i 's/dependencies {/repositories {\n\tmavenCentral()\n\tgoogle()\n}\ndependencies {/' node_modules/@gregfrench/react-native-wheel-picker/android/build.gradle
