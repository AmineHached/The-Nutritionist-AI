import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models.dart';

class ApiService {
  // Use emulator-friendly host by default. Update as needed for device testing.
  static const String baseUrl = String.fromEnvironment('API_BASE', defaultValue: 'http://10.0.2.2:8000');

  static Future<AnalysisResponse> analyzeImage(File imageFile) async {
    final uri = Uri.parse('$baseUrl/api/analyze');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));

    final streamed = await request.send();
    final resp = await http.Response.fromStream(streamed);
    if (resp.statusCode != 200) throw Exception('Analyze failed: ${resp.statusCode} ${resp.body}');

    final Map<String, dynamic> data = json.decode(resp.body);
    return AnalysisResponse.fromJson(data);
  }

  static Future<String> chatWithCoach(String message, List<Map<String, dynamic>> history, {String? contextData}) async {
    final uri = Uri.parse('$baseUrl/api/coach/chat');
    final body = json.encode({'message': message, 'history': history, 'context_data': contextData});
    final resp = await http.post(uri, headers: {'Content-Type': 'application/json'}, body: body).timeout(const Duration(seconds: 30));
    if (resp.statusCode != 200) throw Exception('Coach error: ${resp.statusCode}');
    final Map<String, dynamic> data = json.decode(resp.body);
    return data['reply'] ?? '';
  }

  static Future<String> generateTitle(List<Map<String, dynamic>> history) async {
    final uri = Uri.parse('$baseUrl/api/coach/title');
    final body = json.encode({'history': history});
    final resp = await http.post(uri, headers: {'Content-Type': 'application/json'}, body: body).timeout(const Duration(seconds: 10));
    if (resp.statusCode != 200) return 'Conversation';
    final Map<String, dynamic> data = json.decode(resp.body);
    return data['title'] ?? 'Conversation';
  }
}

// Note: we avoid adding http_parser/http_mime dependencies; let the server infer content type.
