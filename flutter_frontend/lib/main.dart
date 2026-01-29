import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'models.dart';
import 'services/api.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Modernized UI: gradient backgrounds, centered FAB, neumorphic cards,
// animated health ring, refreshed chat bubbles.

void main() {
  runApp(const NutritionistApp());
}

class NutritionistApp extends StatelessWidget {
  const NutritionistApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Nutritionist',
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.tealAccent[700],
        scaffoldBackgroundColor: Colors.transparent,
        textTheme: ThemeData.dark().textTheme.apply(fontFamily: 'Roboto'),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _index = 0;
  AnalysisResponse? _lastAnalysis;
  final ImagePicker _picker = ImagePicker();
  List<Map<String, dynamic>> chatHistory = [];
  // layout constants for responsiveness and readability
  final EdgeInsets _contentPadding = const EdgeInsets.symmetric(horizontal: 18.0, vertical: 14.0);
  final double _maxContentWidth = 900;

  @override
  void initState() {
    super.initState();
    _loadSavedAnalysis();
  }

  Future<void> _loadSavedAnalysis() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString('last_analysis');
    if (s != null) {
      try {
        // saved as JSON map string earlier; we avoid strict parsing here for brevity
      } catch (_) {}
    }
  }

  Future<void> _pickAndAnalyze(ImageSource source) async {
    final XFile? file = await _picker.pickImage(source: source, imageQuality: 85, maxWidth: 1024);
    if (file == null) return;
    final f = File(file.path);
    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));
    try {
      final res = await ApiService.analyzeImage(f);
      setState(() => _lastAnalysis = res);
      final prefs = await SharedPreferences.getInstance();
      prefs.setString('last_analysis', res.toJson().toString());
      Navigator.of(context).pop();
      setState(() => _index = 1); // Show results
    } catch (e) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Analyze failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      _buildCameraPage(),
      _buildResultsPage(),
      _buildCoachPage(),
    ];
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text('The Nutritionist', style: TextStyle(letterSpacing: 0.6)),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F1724), Color(0xFF082032)],
          ),
        ),
        child: SafeArea(child: pages[_index]),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _pickAndAnalyze(ImageSource.camera),
        backgroundColor: Colors.tealAccent[700],
        child: const Icon(Icons.camera_alt, color: Colors.black87, size: 28),
        tooltip: 'Capture',
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        color: Colors.transparent,
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            IconButton(
                onPressed: () => setState(() => _index = 0),
                icon: Icon(Icons.camera_alt, color: _index == 0 ? Colors.tealAccent[700] : Colors.white54)),
            Row(children: [
              IconButton(
                  onPressed: () => setState(() => _index = 1),
                  icon: Icon(Icons.receipt_long, color: _index == 1 ? Colors.tealAccent[700] : Colors.white54)),
              const SizedBox(width: 6),
              IconButton(
                  onPressed: () => setState(() => _index = 2),
                  icon: Icon(Icons.chat_bubble, color: _index == 2 ? Colors.tealAccent[700] : Colors.white54)),
            ])
          ]),
        ),
      ),
    );
  }

  Widget _buildCameraPage() {
    return SafeArea(
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: _maxContentWidth),
          child: Padding(
            padding: _contentPadding,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    gradient: LinearGradient(colors: [Colors.white.withOpacity(0.04), Colors.white.withOpacity(0.02)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    border: Border.all(color: Colors.white12),
                    boxShadow: [BoxShadow(color: Colors.black45, blurRadius: 18, offset: Offset(0, 8))],
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(children: [
                    const SizedBox(height: 6),
                    const Text('Scan your meal', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 10),
                    const Text('Instant nutrition insights with one photo — smart, fast, private.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70, fontSize: 15)),
                    const SizedBox(height: 20),
                    Container(
                      height: 220,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white10, width: 1.5, style: BorderStyle.solid),
                        color: Colors.white.withOpacity(0.02),
                      ),
                      child: Center(child: Icon(Icons.no_food, size: 84, color: Colors.white12)),
                    ),
                    const SizedBox(height: 20),
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                      ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(shape: const StadiumBorder(), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14), backgroundColor: Colors.white, foregroundColor: Colors.black),
                          onPressed: () => _pickAndAnalyze(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt, size: 20),
                          label: const Text('Capture')),
                      const SizedBox(width: 14),
                      OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(shape: const StadiumBorder(), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14), side: BorderSide(color: Colors.white12)),
                          onPressed: () => _pickAndAnalyze(ImageSource.gallery),
                          icon: const Icon(Icons.photo_library, size: 20, color: Colors.white70),
                          label: const Text('Upload', style: TextStyle(color: Colors.white70))),
                    ])
                  ]),
                ),
                const SizedBox(height: 20),
                const Text('Recent scans appear under Results', style: TextStyle(color: Colors.white60, fontSize: 14), textAlign: TextAlign.center),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultsPage() {
    if (_lastAnalysis == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(mainAxisSize: MainAxisSize.min, children: const [
            Icon(Icons.no_food, size: 64, color: Colors.white24),
            SizedBox(height: 12),
            Text('No analysis yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            SizedBox(height: 6),
            Text('Scan a meal to see nutrition details and recommendations.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60)),
          ]),
        ),
      );
    }

    final a = _lastAnalysis!;
    return Padding(
      padding: _contentPadding,
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: _maxContentWidth),
          child: ListView(
            children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Colors.white10),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Health Score', style: TextStyle(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 6),
                      Text('${a.healthScore}', style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 8),
                      Text(a.healthSummary, style: const TextStyle(color: Colors.white60, fontSize: 14)),
                    ]),
                  ),
                  SizedBox(
                    width: 110,
                    height: 110,
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: (a.healthScore.clamp(0, 100) / 100)),
                      duration: const Duration(milliseconds: 900),
                      builder: (context, value, _) => Stack(alignment: Alignment.center, children: [
                        CircularProgressIndicator(value: value, strokeWidth: 10, color: a.healthScore >= 80 ? Colors.greenAccent : (a.healthScore >= 50 ? Colors.orangeAccent : Colors.redAccent)),
                        Text('${(value * 100).toInt()}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                      ]),
                    ),
                  )
                ]),
              ),
              const SizedBox(height: 16),
              const Text('Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white70)),
              const SizedBox(height: 8),
              ...a.foodItems.map((f) => Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.white10),
                    child: ListTile(
                      dense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      leading: CircleAvatar(backgroundColor: Colors.teal.shade700, child: Text('${f.nutrition.caloriesKcal.toInt()}', style: const TextStyle(color: Colors.white))),
                      title: Text(f.name, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white, fontSize: 16)),
                      subtitle: Text('${f.portionDesc} • ${f.healthRating ?? ''}', style: const TextStyle(color: Colors.white60, fontSize: 13)),
                      trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Text('${f.nutrition.caloriesKcal.toInt()} kcal', style: const TextStyle(color: Colors.white60, fontSize: 12))]),
                    ),
                  )),
              const SizedBox(height: 12),
              const Text('Recommendations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white70)),
              const SizedBox(height: 8),
              Wrap(spacing: 8, runSpacing: 6, children: a.recommendations.map((r) => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: Colors.teal.shade700, borderRadius: BorderRadius.circular(20)), child: Text(r, style: const TextStyle(color: Colors.white, fontSize: 13)))).toList()),
              const SizedBox(height: 12),
              if (a.warnings.isNotEmpty) ...[
                const Text('Warnings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.redAccent)),
                const SizedBox(height: 8),
                ...a.warnings.map((w) => ListTile(leading: const Icon(Icons.warning, color: Colors.redAccent), title: Text(w, style: const TextStyle(color: Colors.white70)))),
              ]
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoachPage() {
    final TextEditingController _c = TextEditingController();
    return SafeArea(
      child: Column(children: [
        Expanded(
            child: Padding(
          padding: _contentPadding,
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: _maxContentWidth),
            child: ListView.builder(
                itemCount: chatHistory.length,
                itemBuilder: (context, idx) {
                  final msg = chatHistory[idx];
                  final isUser = (msg['role'] == 'user');
                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      constraints: const BoxConstraints(maxWidth: 520),
                      decoration: BoxDecoration(
                        gradient: isUser
                            ? LinearGradient(colors: [Colors.tealAccent.shade700, Colors.teal.shade700])
                            : LinearGradient(colors: [Colors.white10, Colors.white12]),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(msg['content'] ?? '', style: TextStyle(fontSize: 15, color: isUser ? Colors.black87 : Colors.white70)),
                    ),
                  );
                }),
          ),
        )),
        Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(color: Colors.transparent),
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: _maxContentWidth),
              child: Row(children: [
                Expanded(
                    child: TextField(
                  controller: _c,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration.collapsed(hintText: 'Ask the coach...', hintStyle: TextStyle(color: Colors.white54)),
                )),
                Semantics(
                  label: 'Send message',
                  button: true,
                  child: Ink(
                    decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.tealAccent.shade700, Colors.teal.shade700]), borderRadius: BorderRadius.circular(24)),
                    child: IconButton(
                        tooltip: 'Send',
                        onPressed: () async {
                          final text = _c.text.trim();
                          if (text.isEmpty) return;
                          setState(() => chatHistory.add({'role': 'user', 'content': text}));
                          _c.clear();
                          try {
                            final reply = await ApiService.chatWithCoach(text, chatHistory, contextData: _lastAnalysis != null ? _lastAnalysis!.healthSummary : null);
                            setState(() => chatHistory.add({'role': 'assistant', 'content': reply}));
                          } catch (e) {
                            setState(() => chatHistory.add({'role': 'assistant', 'content': 'Sorry, I cannot reach the coach.'}));
                          }
                        },
                        icon: const Icon(Icons.send, color: Colors.black87)),
                  ),
                )
              ]),
            ),
          ),
        )
      ]),
    );
  }
}